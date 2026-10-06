import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { createCategoria, updateCategoria } from '../../services/categorias.service';
import { mensajeDeError } from '../../utils/formato';

/**
 * Modal para CREAR o EDITAR una categoría.
 *
 * Props:
 *  - categoriaInicial: null → alta, objeto → edición
 *  - onGuardado / onCancelar: avisan al padre
 */
export default function CategoriaFormModal({ categoriaInicial, onGuardado, onCancelar }) {
  const esEdicion = Boolean(categoriaInicial);
  const [nombre, setNombre] = useState(esEdicion ? categoriaInicial.nombre : '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await updateCategoria(categoriaInicial.id, { nombre: nombre.trim() });
        toast.success('Categoría actualizada correctamente.');
      } else {
        await createCategoria({ nombre: nombre.trim() });
        toast.success('Categoría creada correctamente.');
      }
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo guardar la categoría.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={esEdicion ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCancelar}>
      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="categoria-nombre">Nombre *</label>
          <input
            id="categoria-nombre"
            value={nombre}
            onChange={(event) => { setNombre(event.target.value); setError(''); }}
            placeholder="Ej: Postres"
            autoFocus
          />
          {error && <span className="error-msg">{error}</span>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
