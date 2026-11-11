import Modelo from './Modelo';

export const TIPOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta'];

export default class MedioPago extends Modelo {
  /** @param {{ id?: number, tipo: 'Efectivo'|'Transferencia'|'Tarjeta' }} datos */
  constructor({ id, tipo }) {
    super();
    this.id = id;
    this.tipo = tipo;
  }

  toApi() {
    return { tipo: this.tipo };
  }
}
