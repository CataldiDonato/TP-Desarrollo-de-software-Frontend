// Formateadores creados una sola vez para no reconstruirlos en cada render.
const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const fechaHora = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

// 12000 → "$ 12.000"
export function formatearPrecio(valor) {
  if (valor === null || valor === undefined) return '—';
  return moneda.format(Number(valor));
}

// "2026-10-10T21:00:00.000Z" → "10/10/26, 18:00"
export function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  return fechaHora.format(new Date(fechaISO));
}

// Convierte una fecha ISO al formato que usa <input type="datetime-local"> ("2026-10-10T18:00"), en hora local.
export function aInputFechaHora(fechaISO) {
  const fecha = new Date(fechaISO);
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// Mensaje de error que mandó el backend, o uno genérico si no hay.
export function mensajeDeError(error, textoPorDefecto) {
  return error.response?.data?.message || textoPorDefecto;
}
