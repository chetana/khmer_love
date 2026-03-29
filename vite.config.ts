import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    optimizeDeps: {
      exclude: ['@ricky0123/vad-web', 'onnxruntime-web'],
    },
    plugins: [
      react(),
      tailwindcss(),
      viteStaticCopy({
        targets: [
          { src: 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js', dest: './' },
          { src: 'node_modules/@ricky0123/vad-web/dist/silero_vad_v5.onnx', dest: './' },
          { src: 'node_modules/@ricky0123/vad-web/dist/silero_vad_legacy.onnx', dest: './' },
          { src: 'node_modules/onnxruntime-web/dist/*.wasm', dest: './' },
          { src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs', dest: './' },
        ],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Famille Khmère',
          short_name: 'Famille Khmère',
          description: 'Traduction français–khmer pour parler avec ta famille cambodgienne',
          theme_color: '#0F766E',
          background_color: '#0F766E',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/?source=pwa',
          lang: 'fr',
          categories: ['education', 'utilities'],
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          shortcuts: [
            {
              name: 'Traduire',
              url: '/?source=pwa',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Guide culturel',
              url: '/?tab=guide&source=pwa',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
          ],
        },
      }),
    ],
    define: {
      // API key is handled server-side via the /gemini-api-proxy route.
      // The SDK needs a non-empty string to initialize; the real key never reaches the browser bundle.
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'proxy'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
