# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: external-link-checker.spec.ts >> External link checker >> all external links resolve
- Location: tests/external-link-checker.spec.ts:30:3

# Error details

```
Error: Found 5 broken external link(s) out of 43 checked:
  404 https://pretix.eu/correlaid/abo-cl/ (found on /weiterbildungen)
  403 https://pretix.eu/correlaid/fokuskurs-ds/ (found on /kurse/fokuskurs-kommunizieren/)
  403 https://pretix.eu/correlaid/deepdive-ki/ (found on /kurse/deepdive-ki/)
  403 https://pretix.eu/correlaid/correllab-gk/ (found on /kurse/grundkurs/)
  err: apiRequestContext.fetch: read ECONNRESET
Call log:
  - → HEAD https://initiative-wirkungsmanagement.de/
    - user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36
    - accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
    - accept-encoding: gzip,deflate,br
 https://initiative-wirkungsmanagement.de/ (found on /kurse/fokuskurs-kommunizieren/)
```

# Test source

```ts
  27  |  * slower and flakier (rate limits, UA blocks, transient DNS).
  28  |  */
  29  | test.describe("External link checker", () => {
  30  |   test("all external links resolve", async ({ request }) => {
  31  |     test.setTimeout(10 * 60 * 1000);
  32  | 
  33  |     const visited = new Set<string>();
  34  |     const internalQueue: string[] = ["/"];
  35  |     const externalUrls = new Map<string, string>(); // url -> first page it was found on
  36  | 
  37  |     while (internalQueue.length > 0) {
  38  |       const path = internalQueue.shift()!;
  39  |       if (visited.has(path)) continue;
  40  |       visited.add(path);
  41  | 
  42  |       let response;
  43  |       try {
  44  |         response = await request.get(`${baseUrl}${path}`, { maxRedirects: 5 });
  45  |       } catch {
  46  |         continue;
  47  |       }
  48  |       if (response.status() >= 400) continue;
  49  | 
  50  |       const contentType = response.headers()["content-type"] ?? "";
  51  |       if (!contentType.includes("text/html")) continue;
  52  | 
  53  |       const html = await response.text();
  54  |       const linkRegex = /href=["']([^"']*?)["']/g;
  55  |       let match;
  56  |       while ((match = linkRegex.exec(html)) !== null) {
  57  |         const href = match[1];
  58  |         if (
  59  |           !href ||
  60  |           href.startsWith("#") ||
  61  |           href.startsWith("mailto:") ||
  62  |           href.startsWith("tel:") ||
  63  |           href.startsWith("javascript:") ||
  64  |           href.startsWith("data:")
  65  |         ) {
  66  |           continue;
  67  |         }
  68  | 
  69  |         if (href.startsWith("http://") || href.startsWith("https://")) {
  70  |           if (href.startsWith(baseUrl)) continue;
  71  |           const clean = href.split("#")[0];
  72  |           if (!externalUrls.has(clean)) externalUrls.set(clean, path);
  73  |         } else if (href.startsWith("/")) {
  74  |           const resolved = href.split("#")[0];
  75  |           if (resolved && !visited.has(resolved)) internalQueue.push(resolved);
  76  |         }
  77  |       }
  78  |     }
  79  | 
  80  |     const headers = {
  81  |       "User-Agent":
  82  |         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  83  |       Accept:
  84  |         "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  85  |     };
  86  | 
  87  |     const broken: { url: string; status: number | string; foundOn: string }[] =
  88  |       [];
  89  |     const urls = [...externalUrls.entries()];
  90  | 
  91  |     const concurrency = 6;
  92  |     let cursor = 0;
  93  |     async function worker() {
  94  |       while (cursor < urls.length) {
  95  |         const [url, foundOn] = urls[cursor++];
  96  |         let parsed: URL;
  97  |         try {
  98  |           parsed = new URL(url);
  99  |         } catch {
  100 |           broken.push({ url, status: "invalid-url", foundOn });
  101 |           continue;
  102 |         }
  103 |         if (shouldSkip(parsed)) continue;
  104 | 
  105 |         const attempt = async (method: "HEAD" | "GET") =>
  106 |           request.fetch(url, { method, headers, maxRedirects: 5 });
  107 | 
  108 |         try {
  109 |           let res = await attempt("HEAD");
  110 |           if (res.status() === 405 || res.status() === 403 || res.status() === 501) {
  111 |             res = await attempt("GET");
  112 |           }
  113 |           if (res.status() >= 400) {
  114 |             broken.push({ url, status: res.status(), foundOn });
  115 |           }
  116 |         } catch (err) {
  117 |           broken.push({ url, status: `err: ${(err as Error).message}`, foundOn });
  118 |         }
  119 |       }
  120 |     }
  121 |     await Promise.all(Array.from({ length: concurrency }, () => worker()));
  122 | 
  123 |     if (broken.length > 0) {
  124 |       const report = broken
  125 |         .map((b) => `  ${b.status} ${b.url} (found on ${b.foundOn})`)
  126 |         .join("\n");
> 127 |       throw new Error(
      |             ^ Error: Found 5 broken external link(s) out of 43 checked:
  128 |         `Found ${broken.length} broken external link(s) out of ${urls.length} checked:\n${report}`,
  129 |       );
  130 |     }
  131 |   });
  132 | });
  133 | 
```