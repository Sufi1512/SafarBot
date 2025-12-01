import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://safarbot-n24f.onrender.com/',
        changeOrigin: true
      }
    }
  },
  // Disable source maps in development to prevent code exposure
  esbuild: {
    sourcemap: false, // Disable source maps in dev
    minifyIdentifiers: false, // Keep readable names in dev for debugging
    legalComments: 'none' // Remove comments
  }
})
