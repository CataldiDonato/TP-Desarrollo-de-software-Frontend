import { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import { getHistorialPrecios } from '../../services/productos.service'
import { formatearFecha, formatearPrecio, mensajeDeError } from '../../utils/formato'

/**
 * Detalle de un producto: sus datos y el historial de precios (lo pide al backend).
 *
 * Props:
 *  - producto: el producto seleccionado en la tabla
 *  - onCerrar: función para cerrar el modal
 */
export default function HistorialPreciosModal({ producto, onCerrar }) {
  const [precios, setPrecios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarPrecios(producto.id)
  }, [producto.id])

  async function cargarPrecios(idProducto) {
    setCargando(true)
    setError('')
    try {
      const res = await getHistorialPrecios(idProducto)
      setPrecios(res.data)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cargar el historial de precios.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal titulo={producto.nombre} onCerrar={onCerrar}>
      <div className="modal-body">
        <p><strong>Categoría:</strong> {producto.categoria} · <strong>Tipo:</strong> {producto.tipo}</p>
        {producto.descripcion && <p className="text-muted">{producto.descripcion}</p>}

        <h3>Historial de precios</h3>
        {cargando && <p className="state-msg">Cargando...</p>}
        {error && <p className="state-msg state-error">{error}</p>}

        {!cargando && !error && (
          <div className="table-wrapper">
            <table className="data-table compact-table">
              <thead>
                <tr><th>Desde</th><th>Precio</th></tr>
              </thead>
              <tbody>
                {precios.map((precio, index) => (
                  <tr key={precio.fecha_desde}>
                    <td>{formatearFecha(precio.fecha_desde)} {index === 0 && <span className="badge badge-ok">Vigente</span>}</td>
                    <td>{formatearPrecio(precio.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  )
}
