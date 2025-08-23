import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'CampusHub360-Admin',
        short_name: 'CH360 Admin',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});


