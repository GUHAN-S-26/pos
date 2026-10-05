import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// GitHub Pages serves the app from a sub-path:
//   https://guhan-s-26.github.io/retail-pos-inventory-system/
// The repository name is "retail-pos-inventory-system" (renamed from "pos"),
// so all built asset URLs must be prefixed with that path.
// Override with BASE_PATH when serving from a custom domain (set BASE_PATH=/ for root hosting).
const GITHUB_PAGES_BASE = '/retail-pos-inventory-system/';

export default defineConfig(() => {
  return {
    base: process.env.BASE_PATH ?? GITHUB_PAGES_BASE,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
