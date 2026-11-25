import Modelo from './Modelo';

export default class PrecioProducto extends Modelo {
  /** @param {{ id_producto: number, fecha_desde: string, precio: string|number }} datos */
  constructor({ id_producto, fecha_desde, precio }) {
    super();
    this.id_producto = id_producto;
    this.fecha_desde = fecha_desde;
    // Prisma devuelve los Decimal como texto: se pasan a número una sola vez, acá.
    this.precio = Number(precio);
  }
}
