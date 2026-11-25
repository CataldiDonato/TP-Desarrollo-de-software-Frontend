import Modelo, { claseDeEstado } from './Modelo';

export const ESTADOS_MESA = ['Libre', 'Ocupada', 'Reservada'];

export default class Mesa extends Modelo {
  /** @param {{ id?: number, capacidad: number, estado?: 'Libre'|'Ocupada'|'Reservada' }} datos */
  constructor({ id, capacidad, estado = 'Libre' }) {
    super();
    this.id = id;
    this.capacidad = capacidad;
    this.estado = estado;
  }

  /** Una mesa ocupada ya tiene una comanda abierta: no se le puede abrir otra. */
  get estaOcupada() {
    return this.estado === 'Ocupada';
  }

  get claseEstado() {
    return claseDeEstado(this.estado);
  }

  toApi() {
    return { capacidad: Number(this.capacidad), estado: this.estado };
  }
}

/**
 * Lo que devuelve GET /mesas/:id: la mesa más su comanda abierta (si tiene) y sus próximas reservas.
 */
export class MesaDetalle extends Mesa {
  constructor(datos) {
    super(datos);
    this.comandaActiva = datos.comandaActiva ?? null;
    this.proximasReservas = datos.proximasReservas ?? [];
  }
}
