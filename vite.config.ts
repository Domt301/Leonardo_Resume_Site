import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static SPA with path-based routes (/experience, /projects/:id) — base must
// be absolute so asset URLs resolve from nested routes.
export default defineConfig({
  base: '/',
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
