import { useState } from 'react';
import toast from 'react-hot-toast';
import FormModal from '../../components/common/FormModal';
import { createMedioPago, updateMedioPago } from '../../services/mediosPago.service';
import { MedioPago, TIPOS_PAGO } from '../../models/modelos';
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
    const datos = new MedioPago({ tipo }).toApi();
    setGuardando(true);
    try {
      if (esEdicion) {
        await updateMedioPago(medioInicial.id, datos);
        toast.success('Medio de pago actualizado.');
      } else {
        await createMedioPago(datos);
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
    <FormModal
      titulo={esEdicion ? 'Editar medio de pago' : 'Nuevo medio de pago'}
      onSubmit={handleSubmit}
      onCancelar={onCancelar}
      guardando={guardando}
    >
      <div className="form-group">
        <label htmlFor="medio-tipo">Tipo *</label>
        <select id="medio-tipo" value={tipo} onChange={(event) => setTipo(event.target.value)}>
          {TIPOS_PAGO.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
        </select>
      </div>
    </FormModal>
  );
}
