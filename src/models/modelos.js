// Modelos de datos del sistema.
// Representan la forma de los objetos que devuelve (o recibe) la API del backend.
// Los @typedef son comentarios JSDoc: no cambian cómo corre el código, pero el editor
// (VS Code) los usa para autocompletar y avisar si usamos un campo que no existe.

// Valores posibles de cada enum (los mismos que define el schema de Prisma en el backend).
export const ROLES = ['Administrador', 'Mozo', 'Cocinero'];
export const TIPOS_PRODUCTO = ['Plato', 'Bebida'];
export const TIPOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta'];
export const ESTADOS_MESA = ['Libre', 'Ocupada', 'Reservada'];
export const ESTADOS_COMANDA = ['Abierta', 'Pagada', 'Cancelada'];

/**
 * @typedef {Object} Usuario
 * @property {number} id
 * @property {string} nombre
 * @property {string} email
 * @property {'Administrador'|'Mozo'|'Cocinero'} rol
 */

/**
 * @typedef {Object} Categoria
 * @property {number} id
 * @property {string} nombre
 */

/**
 * @typedef {Object} Producto
 * @property {number} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {'Plato'|'Bebida'} tipo
 * @property {number} id_categoria
 * @property {string} categoria   Nombre de la categoría
 * @property {number|null} precio  Precio vigente
 */

/**
 * @typedef {Object} PrecioProducto
 * @property {number} id_producto
 * @property {string} fecha_desde  Fecha en formato ISO
 * @property {string} precio       Prisma devuelve los Decimal como texto
 */

/**
 * @typedef {Object} Mesa
 * @property {number} id
 * @property {number} capacidad
 * @property {'Libre'|'Ocupada'|'Reservada'} estado
 */

/**
 * @typedef {Object} Reserva
 * @property {number} id
 * @property {string} fecha
 * @property {string} nombre_cliente
 * @property {string} telefono_cliente
 * @property {number} cantidad_personas
 * @property {number} id_mesa
 * @property {'Confirmada'|'Cancelada'} estado
 * @property {string|null} motivo_cancelacion
 */

/**
 * @typedef {Object} MedioPago
 * @property {number} id
 * @property {'Efectivo'|'Transferencia'|'Tarjeta'} tipo
 */

/**
 * @typedef {Object} DetalleComanda
 * @property {number} id_producto
 * @property {string} nombre_producto
 * @property {number} cantidad
 * @property {'Pendiente'|'En_Preparacion'|'Finalizada'} estado
 * @property {number} precio
 * @property {number} subtotal
 */

/**
 * @typedef {Object} Comanda
 * @property {number} id
 * @property {string} fecha
 * @property {'Abierta'|'Pagada'|'Cancelada'} estado
 * @property {number} id_mesa
 * @property {{ id: number, nombre: string }} mozo
 * @property {MedioPago|null} medio_pago
 * @property {DetalleComanda[]} detalles
 * @property {number} total
 */
