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
  // In development, Vite serves source files for HMR (this is normal)
  // In production, source maps are disabled in build config above
  // To further reduce code exposure in dev, you can minify:
  esbuild: {
    minifyIdentifiers: false, // Keep readable names in dev for debugging
    legalComments: 'none' // Remove comments
  }
})
