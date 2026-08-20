// Hooks para pedir usuarios, filtrar localmente y conservar el estado del modal.
import { useEffect, useMemo, useState } from 'react';
// Iconos de las acciones disponibles sobre cada usuario.
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
// toast muestra confirmaciones y errores breves sin interrumpir el flujo.
import toast from 'react-hot-toast';
// Servicios CRUD de usuarios: GET, DELETE; el modal utiliza POST y PUT.
import { deleteUsuario, getUsuarios } from '../../services/usuarios.service';
import UsuarioFormModal from './UsuarioFormModal';

// Mapea los roles que devuelve el backend a la clase CSS de su etiqueta visual.
const ROL_CLASE = {
  Administrador: 'role-admin',
  Cocinero: 'role-cook',
  Mozo: 'role-waiter',
};

export default function UsuariosPage() {
  // Datos y estados necesarios para la tabla y el filtro de búsqueda.
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Si es null el modal crea; si contiene un usuario el modal lo edita.
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Se pide el listado al abrir por primera vez la pantalla.
  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    // Restablece la interfaz para cada recarga, incluso después de crear o borrar.
    setCargando(true);
    setError('');
    try {
      const respuesta = await getUsuarios();
      setUsuarios(respuesta.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }

  // Filtrado en memoria para evitar una llamada HTTP por cada carácter escrito.
  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return usuarios;
    return usuarios.filter((usuario) => [usuario.nombre, usuario.email, usuario.rol]
      .some((valor) => valor?.toLowerCase().includes(texto)));
  }, [busqueda, usuarios]);

  function abrirNuevoUsuario() {
    // null le indica al modal que debe mostrarse vacío y usar POST.
    setUsuarioAEditar(null);
    setModalAbierto(true);
  }

  function abrirEdicion(usuario) {
    // Se conserva el objeto seleccionado para precargarlo y luego usar PUT.
    setUsuarioAEditar(usuario);
    setModalAbierto(true);
  }

  async function eliminarUsuario(usuario) {
    // Confirmación nativa para prevenir eliminaciones accidentales.
    if (!window.confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteUsuario(usuario.id);
      toast.success('Usuario eliminado correctamente.');
      // Se vuelve a consultar para que la tabla siempre refleje la base de datos.
      cargarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar el usuario.');
    }
  }

  return (
    <section className="page-container usuarios-page">
      {/* Encabezado y acción de alta de usuario. */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Administrá los accesos y roles del equipo.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={abrirNuevoUsuario}>
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      {/* Búsqueda por cualquiera de las columnas principales. */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          type="search"
          placeholder="Buscar por nombre, email o rol..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>

      {/* Estados de carga y error antes de dibujar la tabla. */}
      {cargando && <p className="state-msg">Cargando usuarios...</p>}
      {error && <p className="state-msg state-error">{error}</p>}

      {/* Tabla: cada fila ofrece edición y eliminación del mismo usuario. */}
      {!cargando && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {/* Se muestra un mensaje si la API no trae datos o el filtro no encuentra coincidencias. */}
              {usuariosFiltrados.length === 0 ? (
                <tr><td colSpan="4" className="table-empty"><Users size={22} /> No hay usuarios que coincidan.</td></tr>
              ) : usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td><strong>{usuario.nombre}</strong></td>
                  <td>{usuario.email}</td>
                  <td><span className={`role-badge ${ROL_CLASE[usuario.rol] || ''}`}>{usuario.rol}</span></td>
                  <td className="table-actions">
                    <button className="btn btn-icon btn-edit" type="button" onClick={() => abrirEdicion(usuario)} aria-label={`Editar a ${usuario.nombre}`} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-icon btn-delete" type="button" onClick={() => eliminarUsuario(usuario)} aria-label={`Eliminar a ${usuario.nombre}`} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* El modal solo existe en el DOM al abrirlo; al guardar se cierra y recarga la tabla. */}
      {modalAbierto && (
        <UsuarioFormModal
          usuarioInicial={usuarioAEditar}
          onCancelar={() => setModalAbierto(false)}
          onGuardado={() => {
            setModalAbierto(false);
            cargarUsuarios();
          }}
        />
      )}
    </section>
  );
}
