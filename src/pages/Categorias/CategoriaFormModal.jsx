import { useState } from 'react';
import toast from 'react-hot-toast';
import FormModal from '../../components/common/FormModal';
import { createCategoria, updateCategoria } from '../../services/categorias.service';
import { mensajeDeError } from '../../utils/formato';
import { Categoria } from '../../models/modelos';

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

    const datos = new Categoria({ nombre }).toApi();
    setGuardando(true);
    try {
      if (esEdicion) {
        await updateCategoria(categoriaInicial.id, datos);
        toast.success('Categoría actualizada correctamente.');
      } else {
        await createCategoria(datos);
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
    <FormModal
      titulo={esEdicion ? 'Editar categoría' : 'Nueva categoría'}
      onSubmit={handleSubmit}
      onCancelar={onCancelar}
      guardando={guardando}
      textoGuardar={esEdicion ? 'Guardar cambios' : 'Crear categoría'}
      noValidate
    >
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
    </FormModal>
  );
}
