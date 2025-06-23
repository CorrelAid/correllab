// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import devtoolsJson from "vite-plugin-devtools-json";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  prefetch: false,
  site: "https://lab.correlaid.org",
  integrations: [
    svelte(),
    sitemap({
      // skip legacy redirects
      filter: (page) =>
        page !== "https://lab.correlaid.org/kurse/kurs1/" &&
        page !== "https://lab.correlaid.org/kurse/kurs2/",
    }),
  ],
  vite: {
    plugins: [devtoolsJson()],
  },
});
