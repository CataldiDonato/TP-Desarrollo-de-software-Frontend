import Modelo, { claseDeEstado } from './Modelo';

export default class Reserva extends Modelo {
  /**
   * @param {{ id?: number, fecha: string, nombre_cliente: string, telefono_cliente: string,
   *           cantidad_personas: number, id_mesa: number, estado?: 'Confirmada'|'Cancelada',
   *           motivo_cancelacion?: string|null }} datos
   */
  constructor({ id, fecha, nombre_cliente, telefono_cliente, cantidad_personas, id_mesa, estado = 'Confirmada', motivo_cancelacion = null }) {
    super();
    this.id = id;
    this.fecha = fecha;
    this.nombre_cliente = nombre_cliente;
    this.telefono_cliente = telefono_cliente;
    this.cantidad_personas = cantidad_personas;
    this.id_mesa = id_mesa;
    this.estado = estado;
    this.motivo_cancelacion = motivo_cancelacion;
  }

  get estaConfirmada() {
    return this.estado === 'Confirmada';
  }

  get claseEstado() {
    return claseDeEstado(this.estado);
  }

  toApi() {
    return {
      fecha: new Date(this.fecha).toISOString(),
      nombre_cliente: this.nombre_cliente.trim(),
      telefono_cliente: this.telefono_cliente.trim(),
      cantidad_personas: Number(this.cantidad_personas),
      id_mesa: Number(this.id_mesa),
    };
  }
}
