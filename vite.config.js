import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/tashan-flash/',
  root: process.cwd(),
  publicDir: path.resolve(process.cwd(), 'public'),
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false
    }
  },
  build: {
    outDir: path.resolve(process.cwd(), 'dist'),
    assetsDir: 'assets',
    sourcemap: true
  }
});
