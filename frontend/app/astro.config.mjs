// @ts-check
import { defineConfig } from "astro/config";
import astroIcon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [astroIcon()],
  output: "server",
  adapter: vercel(),
});