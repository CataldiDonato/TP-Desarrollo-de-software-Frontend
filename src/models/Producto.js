import Modelo from './Modelo';

export const TIPOS_PRODUCTO = ['Plato', 'Bebida'];

export default class Producto extends Modelo {
  /**
   * @param {{ id?: number, nombre: string, descripcion?: string, tipo: 'Plato'|'Bebida',
   *           id_categoria: number, categoria?: string, precio: number|null }} datos
   *   categoria es el nombre de la categoría y precio el vigente.
   */
  constructor({ id, nombre, descripcion, tipo, id_categoria, categoria = '', precio = null }) {
    super();
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion ?? '';
    this.tipo = tipo;
    this.id_categoria = id_categoria;
    this.categoria = categoria;
    this.precio = precio === null ? null : Number(precio);
  }

  get tienePrecio() {
    return this.precio !== null;
  }

  /** ¿Coincide con el texto buscado y con la categoría elegida ('' = todas)? */
  coincideCon(texto, idCategoria) {
    const coincideNombre = this.nombre.toLowerCase().includes(texto.trim().toLowerCase());
    const coincideCategoria = idCategoria === '' || this.id_categoria === Number(idCategoria);
    return coincideNombre && coincideCategoria;
  }

  toApi() {
    return {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      tipo: this.tipo,
      id_categoria: Number(this.id_categoria),
      precio: Number(this.precio),
    };
  }
}
