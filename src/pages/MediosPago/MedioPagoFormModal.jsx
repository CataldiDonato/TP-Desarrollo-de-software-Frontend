import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { createMedioPago, updateMedioPago } from '../../services/mediosPago.service';
import { TIPOS_PAGO } from '../../models/modelos';
import { mensajeDeError } from '../../utils/formato';

/**
 * Modal para CREAR o EDITAR un medio de pago.
 * Los tipos posibles son fijos (Efectivo, Transferencia, Tarjeta), por eso es un desplegable.
 */
export default function MedioPagoFormModal({ medioInicial, onGuardado, onCancelar }) {
  const esEdicion = Boolean(medioInicial);
  const [tipo, setTipo] = useState(esEdicion ? medioInicial.tipo : TIPOS_PAGO[0]);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setGuardando(true);
    try {
      if (esEdicion) {
        await updateMedioPago(medioInicial.id, { tipo });
        toast.success('Medio de pago actualizado.');
      } else {
        await createMedioPago({ tipo });
        toast.success('Medio de pago creado.');
      }
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo guardar el medio de pago.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={esEdicion ? 'Editar medio de pago' : 'Nuevo medio de pago'} onCerrar={onCancelar}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="medio-tipo">Tipo *</label>
          <select id="medio-tipo" value={tipo} onChange={(event) => setTipo(event.target.value)}>
            {TIPOS_PAGO.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
