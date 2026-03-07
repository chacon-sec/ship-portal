import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
    // allow the API base to be configured via env variable so dev containers
    // can point at the backend service name rather than localhost.
    proxy: {
      '/auth': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
