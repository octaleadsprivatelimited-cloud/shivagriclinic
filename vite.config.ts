import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { GET as youtubeFeed } from "./api/youtube.ts";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Match the deployed Vercel Function during local Vite development.
    {
      name: "youtube-feed-local",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.url?.split("?")[0] !== "/api/youtube") return next();
          if (request.method !== "GET") {
            response.statusCode = 405;
            response.setHeader("Allow", "GET");
            response.end();
            return;
          }
          const result = await youtubeFeed();
          response.statusCode = result.status;
          result.headers.forEach((value, key) => response.setHeader(key, value));
          response.end(await result.text());
        });
      },
    },
    // Copy index.html to 404.html so GitHub Pages / static hosts serve SPA on reload
    {
      name: "copy-404",
      closeBundle() {
        const out = path.resolve(import.meta.dirname, "dist");
        const index = path.join(out, "index.html");
        const fallback = path.join(out, "404.html");
        if (fs.existsSync(index)) {
          fs.copyFileSync(index, fallback);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
