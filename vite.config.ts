import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Enable mock data mode when NODE_ENV is 'mock'
    __MOCK_MODE__: JSON.stringify(process.env.NODE_ENV === 'mock'),
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          influx: ['@influxdata/influxdb-client'],
          ui: ['@tanstack/react-query', 'clsx', 'date-fns'],
        },
        // Optimize chunk size warnings
        chunkSizeWarningLimit: 1000,
      },
    },
    // Enable minification and tree shaking
    minify: 'esbuild', // Use esbuild instead of terser for better performance
    // Optimize chunk splitting
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})