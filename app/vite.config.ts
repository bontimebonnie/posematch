import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// Phones only allow camera access over HTTPS, so `npm run dev:phone`
// serves a self-signed cert on the local network.
const phone = process.env.PHONE === '1'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(phone ? [basicSsl()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      // Own service worker so it can handle the Web Share Target POST.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Post Match',
        short_name: 'Post Match',
        description: '模仿卡通 pose 嘅 four-strip 影相 app',
        lang: 'zh-Hant-HK',
        theme_color: '#fff7f2',
        background_color: '#fff7f2',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        share_target: {
          action: '/share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: { files: [{ name: 'files', accept: ['image/*'] }] },
        },
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
