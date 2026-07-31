import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static SPA. Base is relative so the build works on any static host / subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
