import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Empty prefix: read every variable (client/.env and the shell), not just VITE_*.
  const env = loadEnv(mode, process.cwd(), '');

  // In development the API runs on its own port. Proxying it here keeps the
  // browser on a single origin, so the auth cookie and the WebSocket upgrade
  // behave exactly like they do in production.
  const apiTarget = env.API_PROXY_TARGET || `http://localhost:${env.PORT || 5000}`;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.CLIENT_PORT) || 5173,
      proxy: {
        '/api': apiTarget,
        '/uploads': apiTarget,
        '/socket.io': { target: apiTarget, ws: true },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // Libraries change far less often than app code, so keeping them in
          // their own chunks lets browsers cache them across deploys.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
              { name: 'vendor', test: /node_modules/ },
            ],
          },
        },
      },
    },
    test: {
      environment: 'node',
    },
  };
});
