import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      scope: '/mini_game/',
      manifest: {
        name: 'Mini Game Arcade',
        short_name: 'Arcade',
        description: 'A collection of retro mini-games.',
        theme_color: '#a855f7',
        start_url: '/mini_game/',
        scope: '/mini_game/',
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
          }
        ]
      }
    })
  ],
  base: mode === 'production' ? '/mini_game/' : '/',
}))
