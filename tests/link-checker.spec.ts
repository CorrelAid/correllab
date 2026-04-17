import { test } from "@playwright/test";

const baseUrl = "http://localhost:4321";

const skipPatterns = [
  /^\/sitemap/, // sitemap is only generated at build time
];

function shouldSkip(path: string): boolean {
  return skipPatterns.some((pattern) => pattern.test(path));
}

/**
 * Crawl the site starting from the homepage, collect all internal links,
 * and verify none of them return a 404 (or other error status).
 */
test.describe("Link checker — no broken links", () => {
  test("all internal links resolve without 404", async ({ request }) => {
    test.setTimeout(5 * 60 * 1000);
    const visited = new Set<string>();
    const queue: string[] = ["/"];
    const broken: { url: string; status: number; foundOn: string }[] = [];
    const linkSources = new Map<string, string>();

    linkSources.set("/", "start");

    while (queue.length > 0) {
      const path = queue.shift()!;
      if (visited.has(path)) continue;
      visited.add(path);

      let response;
      try {
        response = await request.get(`${baseUrl}${path}`, {
          maxRedirects: 5,
        });
      } catch {
        broken.push({
          url: path,
          status: 0,
          foundOn: linkSources.get(path) ?? "unknown",
        });
        continue;
      }

      if (response.status() >= 400) {
        broken.push({
          url: path,
          status: response.status(),
          foundOn: linkSources.get(path) ?? "unknown",
        });
        continue;
      }

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

        let resolved: string;
        if (href.startsWith("http://") || href.startsWith("https://")) {
          if (!href.startsWith(baseUrl)) continue;
          resolved = href.slice(baseUrl.length) || "/";
        } else if (href.startsWith("/")) {
          resolved = href;
        } else {
          const base = path.endsWith("/") ? path : path + "/";
          resolved = new URL(href, `${baseUrl}${base}`).pathname;
        }

        resolved = resolved.split("#")[0];
        if (!resolved) continue;

        if (
          !visited.has(resolved) &&
          !linkSources.has(resolved) &&
          !shouldSkip(resolved)
        ) {
          queue.push(resolved);
          linkSources.set(resolved, path);
        }
      }
    }

    if (broken.length > 0) {
      const report = broken
        .map((b) => `  ${b.status} ${b.url} (found on ${b.foundOn})`)
        .join("\n");
      throw new Error(
        `Found ${broken.length} broken link(s):\n${report}\n\nChecked ${visited.size} pages total.`,
      );
    }
  });
});
