import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { updateEstadoReserva } from '../../services/reservas.service';
import { mensajeDeError } from '../../utils/formato';

/**
 * Pide el motivo y cancela la reserva. El motivo es obligatorio.
 */
export default function CancelarReservaModal({ reserva, onGuardado, onCancelar }) {
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!motivo.trim()) {
      toast.error('Escribí el motivo de la cancelación');
      return;
    }

    setGuardando(true);
    try {
      await updateEstadoReserva(reserva.id, { estado: 'Cancelada', motivo_cancelacion: motivo.trim() });
      toast.success('La reserva fue cancelada');
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al cancelar la reserva'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`Cancelar reserva de ${reserva.nombre_cliente}`} onCerrar={onCancelar}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="motivo">Motivo de la cancelación *</label>
          <textarea id="motivo" rows={3} value={motivo} onChange={(event) => setMotivo(event.target.value)} autoFocus />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancelar} disabled={guardando}>Volver</button>
          <button type="submit" className="btn btn-danger" disabled={guardando}>
            {guardando ? 'Cancelando...' : 'Cancelar reserva'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
