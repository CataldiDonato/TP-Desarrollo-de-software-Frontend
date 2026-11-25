import { DateTime } from 'luxon';

const ZONA_RESTAURANTE = 'America/Argentina/Buenos_Aires';
const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short', timeStyle: 'short', timeZone: ZONA_RESTAURANTE, hourCycle: 'h23',
});

export function fechaReservaAUTC(valor) {
  const fecha = DateTime.fromISO(valor, { zone: ZONA_RESTAURANTE });
  // Una hora inexistente por un cambio de zona no debe ajustarse silenciosamente.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor) || !fecha.isValid || fecha.toFormat("yyyy-MM-dd'T'HH:mm") !== valor || fecha.getPossibleOffsets().length !== 1) {
    throw new Error('La fecha y hora de la reserva no son válidas.');
  }
  return fecha.toUTC().toISO();
}

export function fechaReservaParaInput(fechaISO) {
  return DateTime.fromISO(fechaISO, { setZone: true }).setZone(ZONA_RESTAURANTE).toFormat("yyyy-MM-dd'T'HH:mm");
}

export function formatearFechaReserva(fechaISO) {
  return fechaISO ? formatoFechaHora.format(new Date(fechaISO)) : '—';
}
