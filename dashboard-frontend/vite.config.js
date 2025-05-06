import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 👈 binds to all network interfaces
    port: 5173        // optional, default is 5173
  }
})
