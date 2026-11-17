import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // reachable from phones on the same Wi-Fi (for scanning QR invites)
    proxy: { '/api': 'http://localhost:4000' },
  },
  preview: {
    proxy: { '/api': 'http://localhost:4000' },
  },
})
