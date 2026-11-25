import Modelo from './Modelo';

export default class Categoria extends Modelo {
  /** @param {{ id?: number, nombre: string }} datos */
  constructor({ id, nombre }) {
    super();
    this.id = id;
    this.nombre = nombre;
  }

  toApi() {
    return { nombre: this.nombre.trim() };
  }
}
