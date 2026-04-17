import { test } from "@playwright/test";

const baseUrl = "http://localhost:4321";

// Domains that block bot requests and aren't worth failing the test over.
// Add here when a host reliably returns 403/429 to Playwright's UA.
const skipHosts: string[] = [
  "linkedin.com",
  "www.linkedin.com",
  "de.linkedin.com",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com",
];

function shouldSkip(url: URL): boolean {
  return skipHosts.some(
    (host) => url.hostname === host || url.hostname.endsWith("." + host),
  );
}

/**
 * Crawl the site, collect every external http(s) URL, and verify none 404.
 *
 * Kept separate from the internal link checker because external checks are
 * slower and flakier (rate limits, UA blocks, transient DNS).
 */
test.describe("External link checker", () => {
  test("all external links resolve", async ({ request }) => {
    test.setTimeout(10 * 60 * 1000);

    const visited = new Set<string>();
    const internalQueue: string[] = ["/"];
    const externalUrls = new Map<string, string>(); // url -> first page it was found on

    while (internalQueue.length > 0) {
      const path = internalQueue.shift()!;
      if (visited.has(path)) continue;
      visited.add(path);

      let response;
      try {
        response = await request.get(`${baseUrl}${path}`, { maxRedirects: 5 });
      } catch {
        continue;
      }
      if (response.status() >= 400) continue;

      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("text/html")) continue;

      const html = await response.text();
      const linkRegex = /href=["']([^"']*?)["']/g;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:") ||
          href.startsWith("data:")
        ) {
          continue;
        }

        if (href.startsWith("http://") || href.startsWith("https://")) {
          if (href.startsWith(baseUrl)) continue;
          const clean = href.split("#")[0];
          if (!externalUrls.has(clean)) externalUrls.set(clean, path);
        } else if (href.startsWith("/")) {
          const resolved = href.split("#")[0];
          if (resolved && !visited.has(resolved)) internalQueue.push(resolved);
        }
      }
    }

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    };

    const broken: { url: string; status: number | string; foundOn: string }[] =
      [];
    const urls = [...externalUrls.entries()];

    const concurrency = 6;
    let cursor = 0;
    async function worker() {
      while (cursor < urls.length) {
        const [url, foundOn] = urls[cursor++];
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          broken.push({ url, status: "invalid-url", foundOn });
          continue;
        }
        if (shouldSkip(parsed)) continue;

        const attempt = async (method: "HEAD" | "GET") =>
          request.fetch(url, { method, headers, maxRedirects: 5 });

        try {
          let res = await attempt("HEAD");
          if (res.status() === 405 || res.status() === 403 || res.status() === 501) {
            res = await attempt("GET");
          }
          if (res.status() >= 400) {
            broken.push({ url, status: res.status(), foundOn });
          }
        } catch (err) {
          broken.push({ url, status: `err: ${(err as Error).message}`, foundOn });
        }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    if (broken.length > 0) {
      const report = broken
        .map((b) => `  ${b.status} ${b.url} (found on ${b.foundOn})`)
        .join("\n");
      throw new Error(
        `Found ${broken.length} broken external link(s) out of ${urls.length} checked:\n${report}`,
      );
    }
  });
});
