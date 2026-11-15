import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { youtubeFeedResponse } from "./api/youtube.ts";
import { socialCountsResponse } from "./api/social-counts.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_* variables to the browser. Load the remaining
  // platform credentials here for this local, server-side middleware only.
  const serverEnv = { ...loadEnv(mode, import.meta.dirname, ""), ...process.env };
  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Match the deployed Vercel Functions during local Vite development.
    {
      name: "channel-api-local",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const route = request.url?.split("?")[0];
          if (route !== "/api/youtube" && route !== "/api/social-counts") return next();
          if (request.method !== "GET") {
            response.statusCode = 405;
            response.setHeader("Allow", "GET");
            response.end();
            return;
          }
          const result = route === "/api/youtube" ? await youtubeFeedResponse(serverEnv) : await socialCountsResponse(serverEnv);
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
  };
});
