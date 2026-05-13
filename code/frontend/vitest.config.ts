/// <reference types="vitest" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['verbose'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules',
        'dist',
        '**/node_modules/**',
        'coverage/**',
        'test/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'vitest.setup.ts',
        '**/*.d.ts',
        'src/test/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})