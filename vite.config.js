import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/tokyo-waterbus-map/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
