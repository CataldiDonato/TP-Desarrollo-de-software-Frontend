import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // API: URL del backend. Se lee del .env en local o de las variables del panel en el deploy (Vercel).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.API': JSON.stringify(env.API || 'http://localhost:3000/api'),
    },
    server: {
      port: 5000 // o el puerto que quieras
    },
    // Configuración de Vitest (tests unitarios). Los tests end-to-end están aparte, en e2e/.
    test: {
      environment: 'jsdom', // simula un navegador para poder renderizar componentes
      include: ['src/**/*.test.{js,jsx}'],
    },
  }
})
