import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCategoria, getCategorias } from '../../services/categorias.service';
import { mensajeDeError } from '../../utils/formato';
import CategoriaFormModal from './CategoriaFormModal';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Si es null el modal crea; si contiene una categoría el modal la edita.
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    setCargando(true);
    setError('');
    try {
      const respuesta = await getCategorias();
      setCategorias(respuesta.data);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar las categorías.'));
    } finally {
      setCargando(false);
    }
  }

  function abrirNueva() {
    setCategoriaAEditar(null);
    setModalAbierto(true);
  }

  function abrirEdicion(categoria) {
    setCategoriaAEditar(categoria);
    setModalAbierto(true);
  }

  async function eliminarCategoria(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    try {
      await deleteCategoria(categoria.id);
      toast.success('Categoría eliminada correctamente.');
      cargarCategorias();
    } catch (err) {
      // Por ejemplo: la categoría tiene productos asociados.
      toast.error(mensajeDeError(err, 'No se pudo eliminar la categoría.'));
    }
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">Agrupan los productos del menú.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={abrirNueva}>
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      {cargando && <p className="state-msg">Cargando categorías...</p>}
      {error && <p className="state-msg state-error">{error}</p>}

      {!cargando && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Nombre</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr><td colSpan="2" className="table-empty">No hay categorías cargadas.</td></tr>
              ) : categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td><strong>{categoria.nombre}</strong></td>
                  <td className="table-actions">
                    <button className="btn btn-icon btn-edit" type="button" onClick={() => abrirEdicion(categoria)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-icon btn-delete" type="button" onClick={() => eliminarCategoria(categoria)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <CategoriaFormModal
          categoriaInicial={categoriaAEditar}
          onCancelar={() => setModalAbierto(false)}
          onGuardado={() => {
            setModalAbierto(false);
            cargarCategorias();
          }}
        />
      )}
    </section>
  );
}
