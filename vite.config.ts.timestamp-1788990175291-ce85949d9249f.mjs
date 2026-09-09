// vite.config.ts
import { defineConfig } from "file:///C:/Users/HP/Desktop/Work/React/ileSure%20Dir/ilesure-pwa/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/HP/Desktop/Work/React/ileSure%20Dir/ilesure-pwa/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///C:/Users/HP/Desktop/Work/React/ileSure%20Dir/ilesure-pwa/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig(({ command }) => ({
  // Pinned so the backend can name a real origin in CORS_ORIGIN and
  // OAUTH_ALLOWED_ORIGINS. Vite otherwise takes 5173 and counts upward, so which app
  // got which port depended on the order they were started in, which meant Google
  // sign-in worked or failed by luck. strictPort fails loudly instead of drifting.
  server: { port: 5273, strictPort: true },
  ...command === "build" ? { esbuild: { drop: ["console", "debugger"] } } : {},
  build: {
    rollupOptions: {
      output: {
        // PERF-FIX (QA-PERF-001): the PWA shipped as ONE 1.26MB JS chunk. On a Nigerian
        // mobile connection that is the single largest first-load cost in the product.
        // PERF-FIX (QA-PERF-001): only LEAF packages are split out. Splitting react
        // itself created a `vendor -> vendor-react -> vendor` cycle, because other
        // vendor code imports react, Rollup warns and chunk load order gets fragile.
        // Icon packs must be matched before anything containing "react", since they
        // live at @hugeicons/react and react-icons.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("lucide-react") || id.includes("@hugeicons") || id.includes("react-icons")) return "vendor-icons";
          if (id.includes("framer-motion") || id.includes("gsap")) return "vendor-animation";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("antd") || id.includes("@ant-design") || id.includes("rc-")) return "vendor-antd";
          return "vendor";
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "il\xE9Sure, Your Sure Home",
        short_name: "il\xE9Sure",
        description: "Find your sure home anywhere. Verified student housing and roommate matching.",
        theme_color: "#FAFAF9",
        background_color: "#FAFAF9",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // PERF-FIX (QA-PERF-002): precaching every raster meant the three splash
        // scenes (2.4MB + 1.7MB + 1.6MB) were downloaded on install, before the user
        // saw anything. Precache the app shell and small assets; let photography be
        // fetched on demand by the runtime caching rules below.
        globPatterns: ["**/*.{js,css,html,ico,svg,webp}"],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        // 2 MiB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.ilesure\.com\/api\/v1\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
                // 1 day
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxEZXNrdG9wXFxcXFdvcmtcXFxcUmVhY3RcXFxcaWxlU3VyZSBEaXJcXFxcaWxlc3VyZS1wd2FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEhQXFxcXERlc2t0b3BcXFxcV29ya1xcXFxSZWFjdFxcXFxpbGVTdXJlIERpclxcXFxpbGVzdXJlLXB3YVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvSFAvRGVza3RvcC9Xb3JrL1JlYWN0L2lsZVN1cmUlMjBEaXIvaWxlc3VyZS1wd2Evdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcblxyXG4vLyBTRUNVUklUWS1GSVggKFAtTTUpOiBzdHJpcCBhbGwgYGNvbnNvbGUuKmAgYW5kIGBkZWJ1Z2dlcmAgc3RhdGVtZW50cyBmcm9tIHByb2R1Y3Rpb25cclxuLy8gYnVpbGRzIHNvIGFueSByZXNpZHVhbCBjcmVkZW50aWFsL3VzZXItZGF0YSBsb2dnaW5nIGNhbm5vdCBsZWFrIGluIHByb2QuIEFwcGxpZWQgb25seVxyXG4vLyBmb3IgYHZpdGUgYnVpbGRgIChjb21tYW5kID09PSAnYnVpbGQnKSBzbyBjb25zb2xlIG91dHB1dCBpcyBwcmVzZXJ2ZWQgZHVyaW5nIGRldi5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4gKHtcclxuICAvLyBQaW5uZWQgc28gdGhlIGJhY2tlbmQgY2FuIG5hbWUgYSByZWFsIG9yaWdpbiBpbiBDT1JTX09SSUdJTiBhbmRcclxuICAvLyBPQVVUSF9BTExPV0VEX09SSUdJTlMuIFZpdGUgb3RoZXJ3aXNlIHRha2VzIDUxNzMgYW5kIGNvdW50cyB1cHdhcmQsIHNvIHdoaWNoIGFwcFxyXG4gIC8vIGdvdCB3aGljaCBwb3J0IGRlcGVuZGVkIG9uIHRoZSBvcmRlciB0aGV5IHdlcmUgc3RhcnRlZCBpbiwgd2hpY2ggbWVhbnQgR29vZ2xlXHJcbiAgLy8gc2lnbi1pbiB3b3JrZWQgb3IgZmFpbGVkIGJ5IGx1Y2suIHN0cmljdFBvcnQgZmFpbHMgbG91ZGx5IGluc3RlYWQgb2YgZHJpZnRpbmcuXHJcbiAgc2VydmVyOiB7IHBvcnQ6IDUyNzMsIHN0cmljdFBvcnQ6IHRydWUgfSxcclxuXHJcbiAgLi4uKGNvbW1hbmQgPT09ICdidWlsZCcgPyB7IGVzYnVpbGQ6IHsgZHJvcDogWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10gYXMgKCdjb25zb2xlJyB8ICdkZWJ1Z2dlcicpW10gfSB9IDoge30pLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIC8vIFBFUkYtRklYIChRQS1QRVJGLTAwMSk6IHRoZSBQV0Egc2hpcHBlZCBhcyBPTkUgMS4yNk1CIEpTIGNodW5rLiBPbiBhIE5pZ2VyaWFuXHJcbiAgICAgICAgLy8gbW9iaWxlIGNvbm5lY3Rpb24gdGhhdCBpcyB0aGUgc2luZ2xlIGxhcmdlc3QgZmlyc3QtbG9hZCBjb3N0IGluIHRoZSBwcm9kdWN0LlxyXG4gICAgICAgIC8vIFBFUkYtRklYIChRQS1QRVJGLTAwMSk6IG9ubHkgTEVBRiBwYWNrYWdlcyBhcmUgc3BsaXQgb3V0LiBTcGxpdHRpbmcgcmVhY3RcclxuICAgICAgICAvLyBpdHNlbGYgY3JlYXRlZCBhIGB2ZW5kb3IgLT4gdmVuZG9yLXJlYWN0IC0+IHZlbmRvcmAgY3ljbGUsIGJlY2F1c2Ugb3RoZXJcclxuICAgICAgICAvLyB2ZW5kb3IgY29kZSBpbXBvcnRzIHJlYWN0LCBSb2xsdXAgd2FybnMgYW5kIGNodW5rIGxvYWQgb3JkZXIgZ2V0cyBmcmFnaWxlLlxyXG4gICAgICAgIC8vIEljb24gcGFja3MgbXVzdCBiZSBtYXRjaGVkIGJlZm9yZSBhbnl0aGluZyBjb250YWluaW5nIFwicmVhY3RcIiwgc2luY2UgdGhleVxyXG4gICAgICAgIC8vIGxpdmUgYXQgQGh1Z2VpY29ucy9yZWFjdCBhbmQgcmVhY3QtaWNvbnMuXHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkOiBzdHJpbmcpIHtcclxuICAgICAgICAgIGlmICghaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSByZXR1cm47XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2x1Y2lkZS1yZWFjdCcpIHx8IGlkLmluY2x1ZGVzKCdAaHVnZWljb25zJykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWljb25zJykpIHJldHVybiAndmVuZG9yLWljb25zJztcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZnJhbWVyLW1vdGlvbicpIHx8IGlkLmluY2x1ZGVzKCdnc2FwJykpIHJldHVybiAndmVuZG9yLWFuaW1hdGlvbic7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykgfHwgaWQuaW5jbHVkZXMoJ2QzLScpKSByZXR1cm4gJ3ZlbmRvci1jaGFydHMnO1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdhbnRkJykgfHwgaWQuaW5jbHVkZXMoJ0BhbnQtZGVzaWduJykgfHwgaWQuaW5jbHVkZXMoJ3JjLScpKSByZXR1cm4gJ3ZlbmRvci1hbnRkJztcclxuICAgICAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnLCAnbWFza2VkLWljb24uc3ZnJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ2lsXHUwMEU5U3VyZSwgWW91ciBTdXJlIEhvbWUnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdpbFx1MDBFOVN1cmUnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRmluZCB5b3VyIHN1cmUgaG9tZSBhbnl3aGVyZS4gVmVyaWZpZWQgc3R1ZGVudCBob3VzaW5nIGFuZCByb29tbWF0ZSBtYXRjaGluZy4nLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI0ZBRkFGOScsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNGQUZBRjknLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJ3B3YS01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgd29ya2JveDoge1xyXG4gICAgICAgIC8vIFBFUkYtRklYIChRQS1QRVJGLTAwMik6IHByZWNhY2hpbmcgZXZlcnkgcmFzdGVyIG1lYW50IHRoZSB0aHJlZSBzcGxhc2hcclxuICAgICAgICAvLyBzY2VuZXMgKDIuNE1CICsgMS43TUIgKyAxLjZNQikgd2VyZSBkb3dubG9hZGVkIG9uIGluc3RhbGwsIGJlZm9yZSB0aGUgdXNlclxyXG4gICAgICAgIC8vIHNhdyBhbnl0aGluZy4gUHJlY2FjaGUgdGhlIGFwcCBzaGVsbCBhbmQgc21hbGwgYXNzZXRzOyBsZXQgcGhvdG9ncmFwaHkgYmVcclxuICAgICAgICAvLyBmZXRjaGVkIG9uIGRlbWFuZCBieSB0aGUgcnVudGltZSBjYWNoaW5nIHJ1bGVzIGJlbG93LlxyXG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28sc3ZnLHdlYnB9J10sXHJcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDIgKiAxMDI0ICogMTAyNCwgLy8gMiBNaUJcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2FwaVxcLmlsZXN1cmVcXC5jb21cXC9hcGlcXC92MVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnYXBpLWNhY2hlJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiA1MCxcclxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAvLyAxIGRheVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgbmV0d29ya1RpbWVvdXRTZWNvbmRzOiAxMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIF1cclxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1csU0FBUyxvQkFBb0I7QUFDblksT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUt4QixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFFBQVEsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLNUMsUUFBUSxFQUFFLE1BQU0sTUFBTSxZQUFZLEtBQUs7QUFBQSxFQUV2QyxHQUFJLFlBQVksVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxVQUFVLEVBQWdDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDMUcsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFRTixhQUFhLElBQVk7QUFDdkIsY0FBSSxDQUFDLEdBQUcsU0FBUyxjQUFjLEVBQUc7QUFDbEMsY0FBSSxHQUFHLFNBQVMsY0FBYyxLQUFLLEdBQUcsU0FBUyxZQUFZLEtBQUssR0FBRyxTQUFTLGFBQWEsRUFBRyxRQUFPO0FBQ25HLGNBQUksR0FBRyxTQUFTLGVBQWUsS0FBSyxHQUFHLFNBQVMsTUFBTSxFQUFHLFFBQU87QUFDaEUsY0FBSSxHQUFHLFNBQVMsVUFBVSxLQUFLLEdBQUcsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUMxRCxjQUFJLEdBQUcsU0FBUyxNQUFNLEtBQUssR0FBRyxTQUFTLGFBQWEsS0FBSyxHQUFHLFNBQVMsS0FBSyxFQUFHLFFBQU87QUFDcEYsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLGlCQUFpQjtBQUFBLE1BQ3hFLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFLUCxjQUFjLENBQUMsaUNBQWlDO0FBQUEsUUFDaEQsK0JBQStCLElBQUksT0FBTztBQUFBO0FBQUEsUUFDMUMsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSztBQUFBO0FBQUEsY0FDM0I7QUFBQSxjQUNBLHVCQUF1QjtBQUFBLFlBQ3pCO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
