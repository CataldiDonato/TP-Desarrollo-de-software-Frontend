/**
 * Clase base de todos los modelos del frontend.
 *
 * Implementa el patrón Factory Method: cada subclase sabe construirse a partir de los datos
 * crudos que devuelve la API (desdeApi). Así los componentes reciben objetos con métodos
 * (ej: mesa.estaLibre) en lugar de JSON suelto, y si la API cambia un campo se corrige en un solo lugar.
 */
export default class Modelo {
  /** Crea una instancia de la subclase que lo llama (ej: Mesa.desdeApi(json) devuelve una Mesa). */
  static desdeApi(datos) {
    return new this(datos);
  }

  static listaDesdeApi(lista) {
    return lista.map((datos) => this.desdeApi(datos));
  }
}

/**
 * Convierte el `data` de una respuesta de axios en instancias de la clase indicada.
 * Se usa en los servicios: api.get('/mesas').then(conModelo(Mesa))
 */
export function conModelo(Clase) {
  return (respuesta) => ({
    ...respuesta,
    data: Array.isArray(respuesta.data) ? Clase.listaDesdeApi(respuesta.data) : Clase.desdeApi(respuesta.data),
  });
}

/** Clase CSS de la etiqueta de un estado (ej: 'En_Preparacion' → 'estado-en_preparacion'). */
export function claseDeEstado(estado) {
  return `estado-${estado.toLowerCase()}`;
}
