import { useState, useEffect } from 'react';
import { createCategoria, updateCategoria } from '../../services/categorias.service';

export default function CategoriaFormModal({ categoriaInicial, onGuardado, onCancelar }) {
  // 1. ESTADO: Guarda lo que el usuario escribe en el input
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);

  // 2. EFECTO: Si nos pasaron una categoría para editar, cargamos su nombre en el input
  useEffect(() => {
    if (categoriaInicial) {
      setNombre(categoriaInicial.nombre);
    }
  }, [categoriaInicial]);

  // 3. FUNCIÓN AL ENVIAR EL FORMULARIO (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setCargando(true);

    try {
      if (categoriaInicial?.id) {
        // Modo EDITAR: Llama al PUT
        await updateCategoria(categoriaInicial.id, { nombre });
      } else {
        // Modo CREAR: Llama al POST
        await createCategoria({ nombre });
      }

      // Avisamos a la página principal que guardó con éxito
      onGuardado();
    } catch (error) {
      alert('Error al guardar la categoría');
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{categoriaInicial ? 'Editar Categoría' : 'Nueva Categoría'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la Categoría:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Bebidas, Postres..."
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}