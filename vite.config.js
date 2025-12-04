import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["framer-motion", "embla-carousel-react"],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (disable if not needed)
    sourcemap: false,
  },

  // Server optimizations
  server: {
    // Enable HMR
    hmr: true,
    // Proxy API requests to backend to solve CORS and enable cookie sharing
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: false, // Keep origin as localhost:5173
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          // Rewrite cookies to work with the proxy
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // Rewrite Set-Cookie headers to use localhost:5173 domain
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              proxyRes.headers["set-cookie"] = cookies.map((cookie) => {
                // Remove domain restriction and set path to /
                return cookie
                  .replace(/Domain=[^;]+;?\s*/gi, "")
                  .replace(/Path=\/api\/auth\/refresh/gi, "Path=/");
              });
            }
          });

          // Log proxy requests for debugging
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "[Proxy]",
              req.method,
              req.url,
              "→",
              options.target + req.url
            );
          });
          proxy.on("error", (err, req, res) => {
            console.error("[Proxy Error]", err);
          });
        },
      },
    },
  },

  // Image optimization
  assetsInlineLimit: 4096, // Inline assets smaller than 4kb as base64
});
