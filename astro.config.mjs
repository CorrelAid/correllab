// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import devtoolsJson from "vite-plugin-devtools-json";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  integrations: [svelte()],
  vite: {
    plugins: [devtoolsJson()],
  },
});
