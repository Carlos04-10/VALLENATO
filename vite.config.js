import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      // Optimizar servidor de desarrollo
      middlewareMode: false,
    },
    // Optimizaciones de dependencias
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'motion/react',
        'lucide-react',
      ],
      exclude: ['@vite/plugin-react'],
    },
    build: {
      // Optimizaciones de build
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          // Code splitting para mejor caching
          manualChunks: {
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'motion': ['motion/react'],
            'lucide': ['lucide-react'],
            'canvas': ['canvas-confetti'],
          },
        },
      },
      // Opciones de compresión
      reportCompressedSize: false,
      chunkSizeWarningLimit: 600,
      sourcemap: mode === 'development',
    },
