import { useState, useEffect } from 'react'
import { getProductos, deleteProducto } from '../../services/productos.service'
import { getCategorias } from '../../services/categorias.service'
import ProductoFormModal from './ProductoFormModal'
import HistorialPreciosModal from './HistorialPreciosModal'
import { Pencil, Trash2, Plus, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { formatearPrecio, mensajeDeError } from '../../utils/formato'

export default function ProductosPage() {
  // Un Mozo puede ver el catálogo para armar pedidos, pero no crear/editar/eliminar productos.
  const { usuario } = useAuth()
  const soloLectura = usuario?.rol === 'Mozo'

  // ── Estado ──────────────────────────────────────────────────────────
  const [productos, setProductos]   = useState([])     // lista completa
  const [categorias, setCategorias] = useState([])     // para el filtro y el formulario
  const [loading, setLoading]       = useState(true)   // spinner inicial
  const [error, setError]           = useState(null)   // mensaje de error
  const [busqueda, setBusqueda]     = useState('')     // filtro de texto
  const [filtroCategoria, setFiltroCategoria] = useState('') // '' = todas
  const [modalOpen, setModalOpen]   = useState(false)  // abre/cierra modal
  const [productoEdit, setProductoEdit] = useState(null)       // null = nuevo, objeto = editar
  const [productoDetalle, setProductoDetalle] = useState(null) // producto que se muestra en el detalle

  // ── Cargar datos al montar el componente ────────────────────────────
  useEffect(() => {
    cargarDatos()
  }, [])

  // Pide productos y categorías al mismo tiempo.
  async function cargarDatos() {
    setLoading(true)
    setError(null)
    try {
      const [resProductos, resCategorias] = await Promise.all([getProductos(), getCategorias()])
      setProductos(resProductos.data)
      setCategorias(resCategorias.data)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar los productos. ¿El backend está corriendo?'))
    } finally {
      setLoading(false)
    }
  }

  // ── Eliminar un producto ─────────────────────────────────────────────
  async function handleEliminar(producto) {
    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return
    try {
      await deleteProducto(producto.id)
      toast.success(`"${producto.nombre}" eliminado correctamente`)
      cargarDatos() // recarga la lista
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al eliminar el producto'))
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
    cargarDatos()
  }

  // ── Filtrar en el cliente: por nombre y por categoría ────────────────
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (filtroCategoria === '' || p.id_categoria === Number(filtroCategoria))
  )

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Encabezado */}
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        {!soloLectura && (
          <button className="btn btn-primary" onClick={handleNuevo}>
            <Plus size={18} /> Nuevo producto
          </button>
        )}
      </div>

      {/* Filtros: buscador por nombre y categoría */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <select className="filter-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
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
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">No hay productos para mostrar.</td>
                </tr>
              ) : (
                productosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.tipo}</td>
                    <td>{p.categoria}</td>
                    <td>{formatearPrecio(p.precio)}</td>
                    <td className="table-actions">
                      <button className="btn btn-icon btn-edit" onClick={() => setProductoDetalle(p)} title="Ver detalle e historial de precios">
                        <Eye size={16} />
                      </button>
                      {!soloLectura && (
                        <>
                          <button className="btn btn-icon btn-edit" onClick={() => handleEditar(p)} title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button className="btn btn-icon btn-delete" onClick={() => handleEliminar(p)} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
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
          categorias={categorias}
          onGuardado={handleGuardado}      // callback al éxito
          onCancelar={() => setModalOpen(false)}
        />
      )}

      {/* Modal de detalle */}
      {productoDetalle && (
        <HistorialPreciosModal producto={productoDetalle} onCerrar={() => setProductoDetalle(null)} />
      )}
    </div>
  )
}
