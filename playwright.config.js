import { defineConfig } from '@playwright/test';

// Configuración de los tests end-to-end (Playwright).
// Antes de correrlos tiene que estar levantado el BACKEND con datos de prueba (npm run seed).
// El frontend lo levanta Playwright solo (o reutiliza el que ya esté corriendo).
const URL_FRONTEND = process.env.E2E_URL || 'http://localhost:5000';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: URL_FRONTEND,
  },
  webServer: {
    command: 'npm run dev',
    url: URL_FRONTEND,
    reuseExistingServer: true,
  },
});
