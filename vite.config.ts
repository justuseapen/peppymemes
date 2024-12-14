import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    sourcemap: true,
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['react-router-dom'],
  },
});
