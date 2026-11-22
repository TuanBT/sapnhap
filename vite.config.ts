import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Site chạy ở root của custom domain https://sapnhap.buitientuan.com/ (GitHub Pages).
  base: '/',
})
