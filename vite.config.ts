// Build/dev config (Vite).
// Boilerplate — you shouldn't need to touch this.
// Adding a plugin is fair game if it genuinely helps; we may ask you to justify it.
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@` → ./src, matching concord-next's apps/web.
    alias: [{ find: "@", replacement: resolve(import.meta.dirname, "./src") }],
  },
  server: {
    allowedHosts: ["vite.cosmo.local"],
    proxy: {
      "/trpc": {
        target: "http://localhost:3001",
        rewrite: (path) => path.slice("/trpc".length),
      },
    },
  },
});
