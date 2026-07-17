import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const manifestIcons = [
  48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512,
].map((size) => ({
  src: `icons/tgc-icon-v3-${size}.png`,
  sizes: `${size}x${size}`,
  type: 'image/png',
  purpose: 'any',
}));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/tgc-icon-v3-48.png',
        'icons/tgc-icon-v3-96.png',
        'icons/tgc-icon-v3-192.png',
        'icons/tgc-icon-v3-512.png',
        'icons/tgc-maskable-v3-192.png',
        'icons/tgc-maskable-v3-512.png',
      ],
      manifest: {
        name: 'The Glorious Church',
        short_name: 'TGC Church',
        description: 'The Glorious Church Management System',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#1e293b',
        theme_color: '#4f46e5',
        icons: [
          ...manifestIcons,
          {
            src: 'icons/tgc-maskable-v3-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/tgc-maskable-v3-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: '/',
  },
});
