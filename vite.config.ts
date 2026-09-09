import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// SECURITY-FIX (P-M5): strip all `console.*` and `debugger` statements from production
// builds so any residual credential/user-data logging cannot leak in prod. Applied only
// for `vite build` (command === 'build') so console output is preserved during dev.
export default defineConfig(({ command }) => ({
  // Pinned so the backend can name a real origin in CORS_ORIGIN and
  // OAUTH_ALLOWED_ORIGINS. Vite otherwise takes 5173 and counts upward, so which app
  // got which port depended on the order they were started in, which meant Google
  // sign-in worked or failed by luck. strictPort fails loudly instead of drifting.
  server: { port: 5273, strictPort: true },

  ...(command === 'build' ? { esbuild: { drop: ['console', 'debugger'] as ('console' | 'debugger')[] } } : {}),
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
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('lucide-react') || id.includes('@hugeicons') || id.includes('react-icons')) return 'vendor-icons';
          if (id.includes('framer-motion') || id.includes('gsap')) return 'vendor-animation';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) return 'vendor-antd';
          return 'vendor';
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'iléSure, Your Sure Home',
        short_name: 'iléSure',
        description: 'Find your sure home anywhere. Verified student housing and roommate matching.',
        theme_color: '#FAFAF9',
        background_color: '#FAFAF9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // PERF-FIX (QA-PERF-002): precaching every raster meant the three splash
        // scenes (2.4MB + 1.7MB + 1.6MB) were downloaded on install, before the user
        // saw anything. Precache the app shell and small assets; let photography be
        // fetched on demand by the runtime caching rules below.
        globPatterns: ['**/*.{js,css,html,ico,svg,webp}'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2 MiB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.ilesure\.com\/api\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ]
}));