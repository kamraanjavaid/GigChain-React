import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    viteCommonjs()

  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://gigchain-backend.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
