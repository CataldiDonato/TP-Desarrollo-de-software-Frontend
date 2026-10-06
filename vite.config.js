import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000 // o el puerto que quieras
  },
  // Configuración de Vitest (tests unitarios). Los tests end-to-end están aparte, en e2e/.
  test: {
    environment: 'jsdom', // simula un navegador para poder renderizar componentes
    include: ['src/**/*.test.{js,jsx}'],
  },
})
