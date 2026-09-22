import { useState, useEffect } from 'react';
import { getCategorias, deleteCategoria } from '../../services/categorias.service';
import CategoriaFormModal from './CategoriaFormModal';

export default function CategoriasPage() {
  // 1. ESTADOS
  const [categorias, setCategorias] = useState([]);       // Lista de categorías que viene de la API
  const [busqueda, setBusqueda] = useState('');           // Texto del buscador
  const [cargando, setCargando] = useState(true);          // Indicador de carga
  
  // Estados para controlar el Modal (Ventana flotante)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);

  // 2. FUNCIÓN PARA PEDIR LAS CATEGORÍAS AL BACKEND
  const cargarCategorias = async () => {
    setCargando(true);
    try {
      const res = await getCategorias();
      setCategorias(res.data);
    } catch (error) {
      alert('Error al cargar las categorías');
      console.error(error);
    } finally {
      setCargando(false);
    }
  };
  
  // 3. EFECTO: Se ejecuta automáticos UNA SOLA VEZ apenas entra a la página
  useEffect(() => {
    cargarCategorias();
  }, []);

  // 4. FUNCIÓN PARA ELIMINAR
  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await deleteCategoria(id);
      alert('Categoría eliminada');
      cargarCategorias(); // Recargamos la lista
    } catch (error) {
      alert('Error al eliminar la categoría');
      console.error(error);
    }
  };

  // 5. FUNCIONES PARA ABRIR EL MODAL
  const abrirModalNuevo = () => {
    setCategoriaAEditar(null); // Como es nuevo, va vacío
    setModalAbierto(true);
  };

  const abrirModalEditar = (categoria) => {
    setCategoriaAEditar(categoria); // Le pasamos la categoría a editar
    setModalAbierto(true);
  };

  // 6. FILTRO DE BÚSQUEDA
  const categoriasFiltradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* CABECERA */}
      <div className="page-header">
        <h1>Gestión de Categorías</h1>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          + Nueva Categoría
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>

      {/* TABLA DE CATEGORÍAS */}
      {cargando ? (
        <p>Cargando categorías...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="3">No se encontraron categorías.</td>
              </tr>
            ) : (
              categoriasFiltradas.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.nombre}</td>
                  <td>
                    <button className="btn-icon" onClick={() => abrirModalEditar(cat)}>
                      ✏️
                    </button>
                    <button className="btn-icon text-danger" onClick={() => handleEliminar(cat.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* MODAL (Solo se dibuja si modalAbierto === true) */}
      {modalAbierto && (
        <CategoriaFormModal
          categoriaInicial={categoriaAEditar}
          onGuardado={() => {
            setModalAbierto(false); // Cerramos modal
            cargarCategorias();     // Recargamos la lista actualizada
          }}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}