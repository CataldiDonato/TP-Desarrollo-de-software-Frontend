// useState controla los campos, errores de validación y el bloqueo del botón de guardado.
import { useState } from 'react';
// Icono del botón de cierre del modal.
import { X } from 'lucide-react';
// Notificaciones de resultado de las operaciones POST y PUT.
import toast from 'react-hot-toast';
// Servicios correspondientes a alta y edición de usuarios.
import { createUsuario, updateUsuario } from '../../services/usuarios.service';

// Valores permitidos por el enum rol_usuario del backend.
const ROLES = ['Administrador', 'Cocinero', 'Mozo'];

// Valores iniciales cuando se abre el modal para crear un usuario nuevo.
const formularioVacio = {
  nombre: '',
  email: '',
  contrasenia: '',
  rol: 'Mozo',
};

export default function UsuarioFormModal({ usuarioInicial, onGuardado, onCancelar }) {
  // La presencia de un usuario define si se ejecutará PUT (edición) o POST (alta).
  const esEdicion = Boolean(usuarioInicial);
  // Precarga los campos al editar; la contraseña se mantiene vacía por seguridad.
  const [formulario, setFormulario] = useState(() => usuarioInicial ? {
    nombre: usuarioInicial.nombre ?? '',
    email: usuarioInicial.email ?? '',
    contrasenia: '',
    rol: usuarioInicial.rol ?? 'Mozo',
  } : formularioVacio);
  // errores guarda un mensaje por campo; guardando evita enviar el formulario dos veces.
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  function handleChange(event) {
    // name coincide con la clave del estado, por eso un único handler sirve para todos los campos.
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    // Estas reglas dan feedback inmediato; el backend también valida como fuente definitiva.
    const nuevosErrores = {};
    if (formulario.nombre.trim().length < 2) nuevosErrores.nombre = 'Ingresá un nombre de al menos 2 caracteres.';
    if (!/^\S+@\S+\.\S+$/.test(formulario.email)) nuevosErrores.email = 'Ingresá un email válido.';
    if (!esEdicion && formulario.contrasenia.length < 8) {
      nuevosErrores.contrasenia = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (esEdicion && formulario.contrasenia && formulario.contrasenia.length < 8) {
      nuevosErrores.contrasenia = 'La contraseña debe tener al menos 8 caracteres.';
    }
    return nuevosErrores;
  }

  async function handleSubmit(event) {
    // Evita que el navegador recargue la página al enviar el formulario.
    event.preventDefault();
    const erroresValidacion = validar();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    // El payload se adapta al contrato del backend: la contraseña no se envía vacía al editar.
    const datos = {
      nombre: formulario.nombre.trim(),
      email: formulario.email.trim(),
      rol: formulario.rol,
      ...(formulario.contrasenia ? { contrasenia: formulario.contrasenia } : {}),
    };

    setGuardando(true);
    try {
      if (esEdicion) {
        // PUT /usuarios/:id para modificar los datos del usuario seleccionado.
        await updateUsuario(usuarioInicial.id, datos);
        toast.success('Usuario actualizado correctamente.');
      } else {
        // POST /usuarios para registrar un nuevo usuario.
        await createUsuario(datos);
        toast.success('Usuario creado correctamente.');
      }
      // El padre cierra este modal y vuelve a obtener el listado actualizado.
      onGuardado();
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    // Click sobre el fondo oscuro cancela; el evento interno se detiene más abajo.
    <div className="modal-overlay" onMouseDown={onCancelar}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usuario-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Cabecera: título dinámico y botón accesible para cerrar. */}
        <header className="modal-header">
          <h2 id="usuario-modal-title">{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <button className="btn btn-icon" type="button" onClick={onCancelar} aria-label="Cerrar formulario">
            <X size={20} />
          </button>
        </header>

        {/* noValidate permite mostrar los mensajes de validación propios, en español. */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Nombre: requerido tanto en alta como en edición. */}
          <div className="form-group">
            <label htmlFor="usuario-nombre">Nombre *</label>
            <input id="usuario-nombre" name="nombre" value={formulario.nombre} onChange={handleChange} autoFocus />
            {errores.nombre && <span className="error-msg">{errores.nombre}</span>}
          </div>

          {/* Email: requerido y validado antes del envío. */}
          <div className="form-group">
            <label htmlFor="usuario-email">Email *</label>
            <input id="usuario-email" name="email" type="email" value={formulario.email} onChange={handleChange} />
            {errores.email && <span className="error-msg">{errores.email}</span>}
          </div>

          {/* Rol: select limitado a los tres valores aceptados por la API. */}
          <div className="form-group">
            <label htmlFor="usuario-rol">Rol *</label>
            <select id="usuario-rol" name="rol" value={formulario.rol} onChange={handleChange}>
              {ROLES.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
            </select>
          </div>

          {/* Contraseña: obligatoria al crear y opcional al editar. */}
          <div className="form-group">
            <label htmlFor="usuario-contrasenia">
              Contraseña {esEdicion ? '(dejá vacío para conservar la actual)' : '*'}
            </label>
            <input
              id="usuario-contrasenia"
              name="contrasenia"
              type="password"
              value={formulario.contrasenia}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errores.contrasenia && <span className="error-msg">{errores.contrasenia}</span>}
          </div>

          {/* Acciones del formulario; se deshabilitan mientras la petición está pendiente. */}
          <footer className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
            <button className="btn btn-primary" type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
