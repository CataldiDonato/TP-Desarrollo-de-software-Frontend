// Punto de entrada de los modelos: permite importar todo desde 'models/modelos'.
// Cada clase está en su propio archivo de esta carpeta.
export { default as Modelo, conModelo } from './Modelo';
export { default as Usuario, ROLES } from './Usuario';
export { default as Categoria } from './Categoria';
export { default as MedioPago, TIPOS_PAGO } from './MedioPago';
export { default as Producto, TIPOS_PRODUCTO } from './Producto';
export { default as PrecioProducto } from './PrecioProducto';
export { default as Mesa, MesaDetalle, ESTADOS_MESA } from './Mesa';
export { default as Reserva } from './Reserva';
export {
  default as Comanda,
  DetalleComanda,
  ItemComanda,
  ESTADOS_COMANDA,
  ESTADOS_DETALLE,
  ESTADO_DETALLE_LEGIBLE,
} from './Comanda';
export { PedidoCocina, ComandaCocina, DetalleCocina } from './Cocina';
