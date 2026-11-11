// Test end-to-end del circuito principal del negocio, con los tres roles:
// el mozo abre una mesa y carga un pedido con observaciones → la cocina lo prepara → el mozo cobra y la mesa se libera.
import { test, expect } from '@playwright/test';

// Usuarios de prueba que crea el seed del backend
const MOZO = { email: 'mozo@restoflow.com', contrasenia: 'mozo1234' };
const COCINERO = { email: 'cocinero@restoflow.com', contrasenia: 'cocinero1234' };

async function iniciarSesion(page, { email, contrasenia }) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(contrasenia);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function cerrarSesion(page) {
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page).toHaveURL(/\/login/);
}

test('el mozo abre una comanda, la cocina la prepara y el mozo la cobra', async ({ page }) => {
  // Texto único para encontrar el pedido en las otras pantallas
  const observaciones = `Sin sal E2E ${Date.now()}`;

  // 1. Mozo: abre una mesa libre y carga un producto con observaciones
  await iniciarSesion(page, MOZO);
  await page.getByRole('button', { name: 'Nueva comanda' }).click();

  const selectMesa = page.getByLabel('Mesa *');
  await expect(selectMesa.locator('option')).not.toHaveCount(1); // además de "-- Elegir mesa --" tiene que haber mesas
  await selectMesa.selectOption({ index: 1 });
  const idMesa = await selectMesa.inputValue();

  await page.getByLabel('Cargar producto').selectOption({ index: 1 });
  await page.getByLabel('Cantidad').fill('2');
  await page.getByLabel('Observaciones').fill(observaciones);
  await page.getByTitle('Agregar').click();
  await expect(page.getByText(`Obs.: ${observaciones}`)).toBeVisible();

  await page.getByRole('button', { name: 'Confirmar y enviar a cocina' }).click();
  await expect(page.getByText(`Comanda de la mesa ${idMesa} enviada a cocina`)).toBeVisible();
  await cerrarSesion(page);

  // 2. Cocinero: ve el pedido con sus observaciones, lo empieza y lo termina
  await iniciarSesion(page, COCINERO);
  await expect(page).toHaveURL(/\/cocina/);
  const fila = page.getByRole('row').filter({ hasText: observaciones });
  await fila.getByRole('button', { name: 'Iniciar preparación' }).click();
  await expect(fila.getByText('En preparación')).toBeVisible();
  await fila.getByRole('button', { name: 'Marcar como listo' }).click();
  // Un plato listo deja de aparecer entre los pedidos activos
  await expect(fila).toHaveCount(0);
  await cerrarSesion(page);

  // 3. Mozo: abre el detalle de la comanda de esa mesa y la cobra en efectivo
  await iniciarSesion(page, MOZO);
  const filaComanda = page.getByRole('row').filter({ hasText: `Mesa ${idMesa}` });
  await filaComanda.getByRole('button', { name: 'Ver detalle' }).click();
  await expect(page.getByRole('dialog').getByText(`Obs.: ${observaciones}`)).toBeVisible();
  await page.getByLabel('Cobrar la cuenta').selectOption({ label: 'Efectivo' });
  await page.getByRole('button', { name: 'Cobrar', exact: true }).click();
  await expect(page.getByText(`Comanda cobrada. La mesa ${idMesa} quedó libre.`)).toBeVisible();
});
