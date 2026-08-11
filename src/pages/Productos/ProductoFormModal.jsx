import { useState } from 'react'
import { createProducto, updateProducto } from '../../services/productos.service'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Modal reutilizable para CREAR o EDITAR un producto.
 *
 * Props:
 *  - productoInicial: null → alta, objeto → edición (precarga el form)
 *  - onGuardado:  función que se llama cuando se guarda con éxito
 *  - onCancelar: función que se llama cuando se cierra sin guardar
 */
export default function ProductoFormModal({ productoInicial, onGuardado, onCancelar }) {
  // ── Determinar si es edición o creación ─────────────────────────────
  const esEdicion = productoInicial !== null && productoInicial !== undefined

  // ── Estado del formulario (campos controlados) ───────────────────────
  const [form, setForm] = useState({
    nombre:      esEdicion ? productoInicial.nombre      : '',
    descripcion: esEdicion ? productoInicial.descripcion : '',
    precio:      esEdicion ? productoInicial.precio      : '',
    categoria:   esEdicion ? productoInicial.categoria   : '',
  })
  const [guardando, setGuardando] = useState(false) // deshabilita el botón mientras espera
  const [errores, setErrores]     = useState({})    // errores de validación por campo

  // ── Actualiza un campo del form cuando el usuario escribe ────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // limpiar el error de ese campo al editar
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  // ── Validación en el cliente ─────────────────────────────────────────
  function validar() {
    const nuevosErrores = {}
    if (!form.nombre.trim())       nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0)
                                   nuevosErrores.precio = 'El precio debe ser un número mayor a 0'
    return nuevosErrores
  }

  // ── Enviar al backend ────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()

    const erroresValidacion = validar()
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    const payload = {
      ...form,
      precio: Number(form.precio), // asegurar tipo numérico
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        // EDITAR: PUT /productos/:id
        await updateProducto(productoInicial._id ?? productoInicial.id, payload)
        toast.success('Producto actualizado correctamente')
      } else {
        // CREAR: POST /productos
        await createProducto(payload)
        toast.success('Producto creado correctamente')
      }
      onGuardado() // avisa al padre para que recargue la lista y cierre el modal
    } catch (err) {
      toast.error('Error al guardar el producto. Revisa la consola.')
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    /* Overlay oscuro detrás del modal */
    <div className="modal-overlay" onClick={onCancelar}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()} // evita cerrar al hacer click dentro
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabecera */}
        <div className="modal-header">
          <h2 id="modal-title">{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button
            className="btn btn-icon"
            onClick={onCancelar}
            title="Cerrar"
            id="btn-cerrar-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>

          {/* Campo: Nombre */}
          <div className="form-group">
            <label htmlFor="campo-nombre">Nombre *</label>
            <input
              id="campo-nombre"
              name="nombre"
              type="text"
              placeholder="Ej: Milanesa napolitana"
              value={form.nombre}
              onChange={handleChange}
              className={errores.nombre ? 'input-error' : ''}
            />
            {errores.nombre && <span className="error-msg">{errores.nombre}</span>}
          </div>

          {/* Campo: Descripción */}
          <div className="form-group">
            <label htmlFor="campo-descripcion">Descripción</label>
            <textarea
              id="campo-descripcion"
              name="descripcion"
              placeholder="Descripción del producto (opcional)"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Campo: Precio */}
          <div className="form-group">
            <label htmlFor="campo-precio">Precio *</label>
            <input
              id="campo-precio"
              name="precio"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.precio}
              onChange={handleChange}
              className={errores.precio ? 'input-error' : ''}
            />
            {errores.precio && <span className="error-msg">{errores.precio}</span>}
          </div>

          {/* Campo: Categoría */}
          <div className="form-group">
            <label htmlFor="campo-categoria">Categoría</label>
            <input
              id="campo-categoria"
              name="categoria"
              type="text"
              placeholder="Ej: Platos principales"
              value={form.categoria}
              onChange={handleChange}
            />
          </div>

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelar}
              disabled={guardando}
              id="btn-cancelar-modal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
              id="btn-guardar-modal"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
