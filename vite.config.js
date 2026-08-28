import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        '**/sdkconfig*',
        '**/build/**',
        '**/main/**',
        '**/CMakeLists.txt',
        '**/managed_components/**',
        '**/dependencies.lock',
        '**/flash_config.json',
        '**/.espressif/**'
      ]
    },
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Content-Security-Policy": "",
    },
    proxy: {
      // ─── Eureka backend (REST API) ───────────────────────────────────────
      '/api/v1': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error - Eureka]:', err.message);
          });
        }
      },
      // ─── Product microservice (local) ────────────────────────────────────
      '/product-api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        rewrite: (path) => path.replace(/^\/product-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error - ProductAPI]:', err.message);
          });
        }
      },
      // ─── Eureka Google OAuth ─────────────────────────────────────────────
      '/auth': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error - Eureka Auth]:', err.message);
          });
        }
      },
      '/product': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error - Eureka Product]:', err.message);
          });
        }
      },
      // ─── Third-party proxies ─────────────────────────────────────────────
      '/api/traxo': {
        target: 'https://lb2.cvip-preprod.citroen.in:40543',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        rewrite: (path) => path.replace(/^\/api\/traxo/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error - TRAXO]:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[Vite Proxy Request - TRAXO]:', req.method, req.url, '->', options.target + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[Vite Proxy Response - TRAXO]:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/jeep': {
        target: 'https://cvipapi-preprod.fca-india.com',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        rewrite: (path) => path.replace(/^\/api\/jeep/, '/jeep'),
        configure: (proxy, options) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error - JEEP]:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[Vite Proxy Request - JEEP]:', req.method, req.url, '->', options.target + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[Vite Proxy Response - JEEP]:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});