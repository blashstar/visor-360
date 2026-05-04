import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts', 'tests/**/*', 'src/main.ts', 'src/App.vue'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vue360',
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
        entryFileNames: 'vue-360.js',
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
