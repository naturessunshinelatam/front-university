import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy específico para /api/proxy (con prioridad)
      '/api/proxy': {
        target: 'https://stage-sunshine-university-75022824581.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // Extraer el path del query parameter y decodificarlo
          // Ejemplo: /api/proxy?path=Categories%3FcategoryId%3D123 -> /api/Categories?categoryId=123
          const match = path.match(/\/api\/proxy\?path=(.+)/);
          if (match) {
            const decodedPath = decodeURIComponent(match[1]);
            return `/api/${decodedPath}`;
          }
          return path;
        }
      },
      // Proxy para /api/public-content - va directo al backend
      // En local, Vite no ejecuta serverless functions, así que usamos el backend directamente
      '/api/public-content': {
        target: 'https://stage-sunshine-university-75022824581.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // Convertir /api/public-content?countryCode=MX a /api/SiteContent/countryAll/MX
          const match = path.match(/\/api\/public-content\?countryCode=(.+)/);
          if (match) {
            const countryCode = match[1];
            return `/api/SiteContent/countryAll/${countryCode}`;
          }
          return path;
        }
      },
      // Proxy general para otros endpoints de API
      '/api': {
        target: 'https://stage-sunshine-university-75022824581.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
