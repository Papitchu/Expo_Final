import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const api = { '/api': 'http://localhost:3000' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Express (locally) and Vercel (in production) serve the built app from the root public/.
  build: { outDir: '../public', emptyOutDir: true },
  server: {
    host: true, // reachable from phones on the same Wi-Fi (for scanning QR invites)
    proxy: api,
  },
  preview: { proxy: api },
})
