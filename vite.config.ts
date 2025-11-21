import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Cargar variables de entorno del modo actual
  const env = loadEnv(mode, process.cwd(), "");
  const backend =
    env.VITE_API_BASE_URL ||
    "https://universidad-sunshine-266897521700.us-central1.run.app";

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        // Proxy específico para /api/proxy (con prioridad)
        "/api/proxy": {
          target: backend,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const match = path.match(/\/api\/proxy\?path=(.+)/);
            if (match) {
              const decodedPath = decodeURIComponent(match[1]);
              return `/api/${decodedPath}`;
            }
            return path;
          },
        },
        // Proxy para /api/public-content - va directo al backend
        // En local, Vite no ejecuta serverless functions, así que usamos el backend directamente
        "/api/public-content": {
          target: backend,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const match = path.match(/\/api\/public-content\?countryCode=(.+)/);
            if (match) {
              const countryCode = match[1];
              return `/api/SiteContent/countryAll/${countryCode}`;
            }
            return path;
          },
        },
        // Proxy general para otros endpoints de API
        "/api": {
          target: backend,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
  });
};
