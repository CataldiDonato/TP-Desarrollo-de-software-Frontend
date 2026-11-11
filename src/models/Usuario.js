import Modelo from './Modelo';

export const ROLES = ['Administrador', 'Mozo', 'Cocinero'];

const CLASE_POR_ROL = {
  Administrador: 'role-admin',
  Cocinero: 'role-cook',
  Mozo: 'role-waiter',
};

export default class Usuario extends Modelo {
  /**
   * @param {{ id?: number, nombre: string, email: string, rol: 'Administrador'|'Mozo'|'Cocinero' }} datos
   */
  constructor({ id, nombre, email, rol }) {
    super();
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.rol = rol;
  }

  get claseRol() {
    return CLASE_POR_ROL[this.rol] ?? '';
  }

  /**
   * Datos a enviar al crear o editar. La contraseña solo se manda si se escribió una
   * (al editar, si queda vacía el backend conserva la anterior).
   */
  toApi(contrasenia) {
    const datos = { nombre: this.nombre.trim(), email: this.email.trim(), rol: this.rol };
    if (contrasenia) datos.contrasenia = contrasenia;
    return datos;
  }
}
