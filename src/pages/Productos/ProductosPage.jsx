import { useState, useEffect } from 'react'
import { getProductos, deleteProducto } from '../../services/productos.service'
import ProductoFormModal from './ProductoFormModal'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductosPage() {
  // ── Estado ──────────────────────────────────────────────────────────
  const [productos, setProductos] = useState([])       // lista completa
  const [loading, setLoading]     = useState(true)     // spinner inicial
  const [error, setError]         = useState(null)     // mensaje de error
  const [busqueda, setBusqueda]   = useState('')        // filtro de texto
  const [modalOpen, setModalOpen] = useState(false)    // abre/cierra modal
  const [productoEdit, setProductoEdit] = useState(null) // null = nuevo, objeto = editar

  // ── Cargar datos al montar el componente ────────────────────────────
  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    setLoading(true)
    setError(null)
    try {
      const res = await getProductos()
      setProductos(res.data)
    } catch (err) {
      setError('No se pudo cargar los productos. ¿El backend está corriendo?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Eliminar un producto ─────────────────────────────────────────────
  async function handleEliminar(id, nombre) {
    if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return
    try {
      await deleteProducto(id)
      toast.success(`"${nombre}" eliminado correctamente`)
      cargarProductos() // recarga la lista
    } catch (err) {
      toast.error('Error al eliminar el producto')
      console.error(err)
    }
  }

  // ── Abrir modal para CREAR ───────────────────────────────────────────
  function handleNuevo() {
    setProductoEdit(null)   // sin datos = formulario vacío
    setModalOpen(true)
  }

  // ── Abrir modal para EDITAR ──────────────────────────────────────────
  function handleEditar(producto) {
    setProductoEdit(producto) // precarga los datos en el form
    setModalOpen(true)
  }

  // ── Cierra el modal y recarga la lista (lo llama el modal al guardar) ─
  function handleGuardado() {
    setModalOpen(false)
    cargarProductos()
  }

  // ── Filtrar en el cliente mientras escribe ───────────────────────────
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Encabezado */}
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <button className="btn btn-primary" onClick={handleNuevo} id="btn-nuevo-producto">
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {/* Buscador */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          id="input-buscar-producto"
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Estados de carga y error */}
      {loading && <p className="state-msg">Cargando productos...</p>}
      {error   && <p className="state-msg state-error">{error}</p>}

      {/* Tabla */}
      {!loading && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No hay productos para mostrar.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map(p => (
                  <tr key={p._id ?? p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.descripcion ?? '—'}</td>
                    <td>${Number(p.precio).toFixed(2)}</td>
                    <td>{p.categoria ?? '—'}</td>
                    <td className="table-actions">
                      <button
                        className="btn btn-icon btn-edit"
                        onClick={() => handleEditar(p)}
                        title="Editar"
                        id={`btn-editar-${p._id ?? p.id}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn btn-icon btn-delete"
                        onClick={() => handleEliminar(p._id ?? p.id, p.nombre)}
                        title="Eliminar"
                        id={`btn-eliminar-${p._id ?? p.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de alta/edición */}
      {modalOpen && (
        <ProductoFormModal
          productoInicial={productoEdit}   // null → crear, objeto → editar
          onGuardado={handleGuardado}      // callback al éxito
          onCancelar={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
