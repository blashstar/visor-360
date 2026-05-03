import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VisorEsferico',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'three', 'hammerjs'],
      output: {
        globals: {
          vue: 'Vue',
          three: 'THREE',
          hammerjs: 'Hammer',
        },
        preserveModules: true,
      },
    },
    minify: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
