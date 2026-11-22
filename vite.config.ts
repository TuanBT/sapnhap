import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages phục vụ site tại https://tuanbt.github.io/sapnhap/
  // Đặt cố định để dev / preview / production dùng cùng một đường dẫn.
  base: '/sapnhap/',
})
