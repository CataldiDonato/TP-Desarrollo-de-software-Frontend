import Modelo, { claseDeEstado } from './Modelo';
import { DetalleComanda, ESTADO_DETALLE_LEGIBLE } from './Comanda';

// Orden de los estados en la cocina: Pendiente → En_Preparacion → Finalizada.
const SIGUIENTE_ESTADO = {
  Pendiente: 'En_Preparacion',
  En_Preparacion: 'Finalizada',
};

/** Un producto que la cocina tiene que preparar (respuesta de GET /cocina/pedidos). */
export class PedidoCocina extends Modelo {
  constructor({ idComanda, idProducto, cantidad, estado, observaciones = null, producto, comanda, cocinero = null }) {
    super();
    this.idComanda = idComanda;
    this.idProducto = idProducto;
    this.cantidad = cantidad;
    this.estado = estado;
    this.observaciones = observaciones;
    this.producto = producto;
    this.comanda = comanda;
    this.cocinero = cocinero;
  }

  /** Identifica al pedido: un producto aparece una sola vez por comanda. */
  get clave() {
    return `${this.idComanda}-${this.idProducto}`;
  }

  get idMesa() {
    return this.comanda?.id_mesa ?? null;
  }

  /** Estado al que pasa con el próximo botón, o null si ya está listo. */
  get siguienteEstado() {
    return SIGUIENTE_ESTADO[this.estado] ?? null;
  }

  get estadoLegible() {
    return ESTADO_DETALLE_LEGIBLE[this.estado] ?? this.estado;
  }

  get claseEstado() {
    return claseDeEstado(this.estado);
  }
}

/** Producto de la comanda con los datos que le importan a la cocina: tipo y quién lo preparó. */
export class DetalleCocina extends DetalleComanda {
  constructor(datos) {
    super(datos);
    this.tipo = datos.tipo;
    this.cocinero = datos.cocinero ?? null;
  }
}

/** Detalle de una comanda visto desde la cocina (respuesta de GET /cocina/comandas/:id). */
export class ComandaCocina extends Modelo {
  constructor({ id, fecha, estado, mesa, mozo, detalles = [] }) {
    super();
    this.id = id;
    this.fecha = fecha;
    this.estado = estado;
    this.mesa = mesa;
    this.mozo = mozo;
    this.detalles = DetalleCocina.listaDesdeApi(detalles);
  }

  /** Cuántos productos de la comanda ya están listos, para mostrar el avance. */
  get cantidadListos() {
    return this.detalles.filter((detalle) => detalle.estado === 'Finalizada').length;
  }
}
