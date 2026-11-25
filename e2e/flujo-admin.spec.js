// Test end-to-end: abre la app en un navegador real y la usa como lo haría una persona.
import { test, expect } from '@playwright/test';

// Usuario de prueba que crea el seed del backend (se puede cambiar con variables de entorno)
const EMAIL = process.env.E2E_EMAIL || 'admin@restoflow.com';
const CONTRASENIA = process.env.E2E_PASSWORD || 'admin1234';

async function iniciarSesion(page, email, contrasenia) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(contrasenia);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

test('con una contraseña incorrecta muestra el error y no entra', async ({ page }) => {
  await iniciarSesion(page, EMAIL, 'contraseña-incorrecta');

  await expect(page.getByText('Credenciales inválidas.')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('el administrador entra, ve el resumen y hace el CRUD de una categoría', async ({ page }) => {
  // 1. Login → el admin cae en el Home
  await iniciarSesion(page, EMAIL, CONTRASENIA);
  await expect(page.getByRole('heading', { name: 'Resumen del restaurante' })).toBeVisible();

  // 2. Navega a Categorías desde la barra de navegación
  await page.getByRole('link', { name: 'Categorías' }).click();
  await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible();

  // 3. Crea una categoría con un nombre único
  const nombre = `Categoría E2E ${Date.now()}`;
  await page.getByRole('button', { name: 'Nueva categoría' }).click();
  await page.getByLabel('Nombre *').fill(nombre);
  await page.getByRole('button', { name: 'Crear categoría' }).click();
  const fila = page.getByRole('row', { name: new RegExp(nombre) });
  await expect(fila).toBeVisible();

  // 4. La elimina (acepta el cuadro de confirmación) y verifica que ya no está
  page.once('dialog', (dialogo) => dialogo.accept());
  await fila.getByTitle('Eliminar').click();
  await expect(page.getByText('Categoría eliminada correctamente.')).toBeVisible();
  await expect(fila).toHaveCount(0);
});

test('un usuario sin sesión que entra a una pantalla protegida va al login', async ({ page }) => {
  await page.goto('/productos');
  await expect(page).toHaveURL(/\/login/);
});
