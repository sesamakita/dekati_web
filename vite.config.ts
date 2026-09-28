import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api-wilayah': {
        target: 'https://emsifa.github.io/api-wilayah-indonesia/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-wilayah/, ''),
      },
    },
  },
});
