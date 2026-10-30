/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [vue()],
  // Bản dịch --ssr chỉ dùng cho bước sinh HTML tĩnh (scripts/prerender.mjs), không cần chép ảnh trong public/
  build: { copyPublicDir: !isSsrBuild },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5300, host: '127.0.0.1' },
  preview: { port: 5301, host: '127.0.0.1' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
