import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",

  adapter: cloudflare({
    mode: "directory"
  }),

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
  },

  experimental: {
    session: true
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/cloudflare'
    }
  },

  integrations: [react()]
});