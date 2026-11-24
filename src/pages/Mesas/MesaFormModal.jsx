import { useState } from 'react';
import toast from 'react-hot-toast';
import FormModal from '../../components/common/FormModal';
import { createMesa, updateMesa } from '../../services/mesas.service';
import { mensajeDeError } from '../../utils/formato';
import { Mesa } from '../../models/modelos';

/**
 * Modal para CREAR o EDITAR una mesa.
 * Al editar se puede cambiar el estado entre Libre y Reservada.
 * "Ocupada" no se elige a mano: la pone el sistema cuando se abre una comanda.
 */
export default function MesaFormModal({ mesaInicial, onGuardado, onCancelar }) {
  const esEdicion = Boolean(mesaInicial);
  const [capacidad, setCapacidad] = useState(esEdicion ? mesaInicial.capacidad : '');
  const [estado, setEstado] = useState(esEdicion ? mesaInicial.estado : 'Libre');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const estaOcupada = esEdicion && mesaInicial.estaOcupada;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!Number.isInteger(Number(capacidad)) || Number(capacidad) <= 0) {
      setError('La capacidad debe ser un número entero mayor a 0.');
      return;
    }

    // Al crear, el backend ignora el estado: toda mesa nueva arranca Libre.
    const datos = new Mesa({ capacidad, estado }).toApi();
    setGuardando(true);
    try {
      if (esEdicion) {
        await updateMesa(mesaInicial.id, datos);
        toast.success('Mesa actualizada correctamente.');
      } else {
        await createMesa(datos);
        toast.success('Mesa creada correctamente.');
      }
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo guardar la mesa.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <FormModal
      titulo={esEdicion ? `Editar mesa ${mesaInicial.id}` : 'Nueva mesa'}
      onSubmit={handleSubmit}
      onCancelar={onCancelar}
      guardando={guardando}
      noValidate
    >
      <div className="form-group">
        <label htmlFor="mesa-capacidad">Capacidad (personas) *</label>
        <input
          id="mesa-capacidad"
          type="number"
          min="1"
          step="1"
          value={capacidad}
          onChange={(event) => { setCapacidad(event.target.value); setError(''); }}
          autoFocus
        />
        {error && <span className="error-msg">{error}</span>}
      </div>

      {esEdicion && (
        <div className="form-group">
          <label htmlFor="mesa-estado">Estado</label>
          <select id="mesa-estado" value={estado} onChange={(event) => setEstado(event.target.value)} disabled={estaOcupada}>
            {estaOcupada && <option value="Ocupada">Ocupada</option>}
            <option value="Libre">Libre</option>
            <option value="Reservada">Reservada</option>
          </select>
          {estaOcupada && <span className="form-hint">La mesa tiene una comanda abierta. Se libera al cobrarla o cancelarla.</span>}
        </div>
      )}
    </FormModal>
  );
}
