import Modelo, { claseDeEstado } from './Modelo';
import MedioPago from './MedioPago';

export const ESTADOS_COMANDA = ['Abierta', 'Pagada', 'Cancelada'];
export const ESTADOS_DETALLE = ['Pendiente', 'En_Preparacion', 'Finalizada'];

/** Texto para mostrar de un estado de cocina ('En_Preparacion' → 'En preparación'). */
export const ESTADO_DETALLE_LEGIBLE = {
  Pendiente: 'Pendiente',
  En_Preparacion: 'En preparación',
  Finalizada: 'Listo',
};

/** Un producto dentro de una comanda, con el precio que tenía cuando se abrió. */
export class DetalleComanda extends Modelo {
  constructor({ id_producto, nombre_producto, cantidad, estado, observaciones = null, precio = 0, subtotal = 0 }) {
    super();
    this.id_producto = id_producto;
    this.nombre_producto = nombre_producto;
    this.cantidad = cantidad;
    this.estado = estado;
    this.observaciones = observaciones;
    this.precio = precio;
    this.subtotal = subtotal;
  }

  /** Solo se puede cambiar o quitar lo que la cocina todavía no empezó. */
  get esModificable() {
    return this.estado === 'Pendiente';
  }

  get estadoLegible() {
    return ESTADO_DETALLE_LEGIBLE[this.estado] ?? this.estado;
  }
}

export default class Comanda extends Modelo {
  constructor({ id, fecha, estado, id_mesa, mozo, medio_pago = null, detalles = [], total = 0 }) {
    super();
    this.id = id;
    this.fecha = fecha;
    this.estado = estado;
    this.id_mesa = id_mesa;
    this.mozo = mozo;
    this.medio_pago = medio_pago ? MedioPago.desdeApi(medio_pago) : null;
    this.detalles = DetalleComanda.listaDesdeApi(detalles);
    this.total = total;
  }

  get estaAbierta() {
    return this.estado === 'Abierta';
  }

  get claseEstado() {
    return claseDeEstado(this.estado);
  }
}

/**
 * Producto que el mozo va cargando antes de enviar una comanda nueva.
 * Es un modelo de REQUEST: toApi() arma el objeto que espera POST /comandas.
 */
export class ItemComanda {
  /** @param {import('./Producto').default} producto @param {number} cantidad @param {string} observaciones */
  constructor(producto, cantidad, observaciones = '') {
    this.producto = producto;
    this.cantidad = cantidad;
    this.observaciones = observaciones.trim();
  }

  get subtotal() {
    return (this.producto.precio ?? 0) * this.cantidad;
  }

  /** Devuelve un ítem nuevo con más unidades (no modifica este: React necesita objetos nuevos). */
  sumar(cantidad, observaciones = '') {
    const notas = [this.observaciones, observaciones.trim()].filter(Boolean).join(' · ');
    return new ItemComanda(this.producto, this.cantidad + cantidad, notas);
  }

  toApi() {
    return {
      id_producto: this.producto.id,
      cantidad: this.cantidad,
      ...(this.observaciones && { observaciones: this.observaciones }),
    };
  }
}
