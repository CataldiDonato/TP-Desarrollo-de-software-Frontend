import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { createProducto, updateProducto } from '../../services/productos.service'
import { TIPOS_PRODUCTO } from '../../models/modelos'
import { mensajeDeError } from '../../utils/formato'

/**
 * Modal reutilizable para CREAR o EDITAR un producto.
 *
 * Props:
 *  - productoInicial: null → alta, objeto → edición (precarga el form)
 *  - categorias: lista de categorías para el desplegable
 *  - onGuardado:  función que se llama cuando se guarda con éxito
 *  - onCancelar: función que se llama cuando se cierra sin guardar
 */
export default function ProductoFormModal({ productoInicial, categorias, onGuardado, onCancelar }) {
  // ── Determinar si es edición o creación ─────────────────────────────
  const esEdicion = Boolean(productoInicial)

  // ── Estado del formulario (campos controlados) ───────────────────────
  // Los nombres de los campos son los mismos que espera el backend.
  const [form, setForm] = useState({
    nombre:       esEdicion ? productoInicial.nombre          : '',
    descripcion:  esEdicion ? productoInicial.descripcion     : '',
    precio:       esEdicion ? productoInicial.precio ?? ''    : '',
    tipo:         esEdicion ? productoInicial.tipo            : 'Plato',
    id_categoria: esEdicion ? productoInicial.id_categoria    : '',
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

  // ── Validación en el cliente (el backend vuelve a validar) ───────────
  function validar() {
    const nuevosErrores = {}
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!form.precio || Number(form.precio) <= 0) nuevosErrores.precio = 'El precio debe ser un número mayor a 0'
    if (!form.id_categoria) nuevosErrores.id_categoria = 'Elegí una categoría'
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
      precio: Number(form.precio),             // asegurar tipo numérico
      id_categoria: Number(form.id_categoria),
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        // EDITAR: PUT /productos/:id
        await updateProducto(productoInicial.id, payload)
        toast.success('Producto actualizado correctamente')
      } else {
        // CREAR: POST /productos
        await createProducto(payload)
        toast.success('Producto creado correctamente')
      }
      onGuardado() // avisa al padre para que recargue la lista y cierre el modal
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al guardar el producto'))
    } finally {
      setGuardando(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <Modal titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'} onCerrar={onCancelar}>
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

        {/* Campo: Tipo */}
        <div className="form-group">
          <label htmlFor="campo-tipo">Tipo *</label>
          <select id="campo-tipo" name="tipo" value={form.tipo} onChange={handleChange}>
            {TIPOS_PRODUCTO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>

        {/* Campo: Categoría (desplegable con las categorías del backend) */}
        <div className="form-group">
          <label htmlFor="campo-categoria">Categoría *</label>
          <select
            id="campo-categoria"
            name="id_categoria"
            value={form.id_categoria}
            onChange={handleChange}
            className={errores.id_categoria ? 'input-error' : ''}
          >
            <option value="">-- Elegir categoría --</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
          {errores.id_categoria && <span className="error-msg">{errores.id_categoria}</span>}
          {categorias.length === 0 && (
            <span className="error-msg">No hay categorías cargadas. Creá una en la pantalla Categorías.</span>
          )}
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
          {esEdicion && <span className="form-hint">Si cambiás el precio, el anterior queda guardado en el historial.</span>}
        </div>

        {/* Botones */}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
