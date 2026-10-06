import { defineConfig } from '@playwright/test';

// Configuración de los tests end-to-end (Playwright).
// Antes de correrlos tiene que estar levantado el BACKEND con datos de prueba (npm run seed).
// El frontend lo levanta Playwright solo (o reutiliza el que ya esté corriendo).
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.E2E_URL || 'http://localhost:5000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
  },
});
