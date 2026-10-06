import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { createReserva, updateReserva } from '../../services/reservas.service';
import { getMesasDisponibles } from '../../services/mesas.service';
import { aInputFechaHora, mensajeDeError } from '../../utils/formato';

/**
 * Modal para CREAR o EDITAR una reserva.
 * Primero se cargan fecha y cantidad de personas; con eso se buscan las mesas
 * que tienen lugar y no están reservadas en ese horario.
 */
export default function ReservaFormModal({ reservaInicial, onGuardado, onCancelar }) {
  const esEdicion = Boolean(reservaInicial);

  const [formData, setFormData] = useState({
    nombre_cliente: esEdicion ? reservaInicial.nombre_cliente : '',
    telefono_cliente: esEdicion ? reservaInicial.telefono_cliente : '',
    fecha: esEdicion ? aInputFechaHora(reservaInicial.fecha) : '',
    cantidad_personas: esEdicion ? reservaInicial.cantidad_personas : '',
    id_mesa: esEdicion ? reservaInicial.id_mesa : ''
  });
  // Al editar, la mesa actual aparece en el desplegable aunque no se haya buscado.
  const [mesasDisponibles, setMesasDisponibles] = useState(
    esEdicion ? [{ id: reservaInicial.id_mesa, actual: true }] : []
  );
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const buscarMesasLibres = async () => {
    if (!formData.fecha || !formData.cantidad_personas) {
      toast.error('Primero completá la fecha y la cantidad de personas');
      return;
    }

    setCargandoMesas(true);
    try {
      const fechaISO = new Date(formData.fecha).toISOString();
      const res = await getMesasDisponibles(fechaISO, formData.cantidad_personas);
      setMesasDisponibles(res.data);
      setFormData(prev => ({ ...prev, id_mesa: '' }));
      if (res.data.length === 0) {
        toast.error('No hay mesas disponibles para ese horario');
      } else {
        toast.success(`Se encontraron ${res.data.length} mesas disponibles`);
      }
    } catch (error) {
      toast.error(mensajeDeError(error, 'Error al buscar mesas libres'));
    } finally {
      setCargandoMesas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_mesa) {
      toast.error('Buscá y seleccioná una mesa disponible');
      return;
    }

    setCargando(true);
    try {
      // Formatear datos antes de enviarlos (fecha ISO y números enteros)
      const dataAEnviar = {
        ...formData,
        fecha: new Date(formData.fecha).toISOString(),
        cantidad_personas: Number(formData.cantidad_personas),
        id_mesa: Number(formData.id_mesa)
      };

      if (esEdicion) {
        await updateReserva(reservaInicial.id, dataAEnviar);
        toast.success('Reserva actualizada');
      } else {
        await createReserva(dataAEnviar);
        toast.success('Reserva confirmada con éxito');
      }
      onGuardado();
    } catch (error) {
      toast.error(mensajeDeError(error, 'Error al guardar la reserva'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal titulo={esEdicion ? 'Editar reserva' : 'Nueva reserva'} onCerrar={onCancelar}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reserva-nombre">Nombre del cliente *</label>
          <input id="reserva-nombre" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="reserva-telefono">Teléfono *</label>
          <input id="reserva-telefono" name="telefono_cliente" type="tel" value={formData.telefono_cliente} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="reserva-fecha">Fecha y hora *</label>
          <input id="reserva-fecha" type="datetime-local" name="fecha" value={formData.fecha} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="reserva-personas">Cantidad de personas *</label>
          <input id="reserva-personas" type="number" name="cantidad_personas" min="1" value={formData.cantidad_personas} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="reserva-mesa">Mesa *</label>
          <div className="input-con-boton">
            <select id="reserva-mesa" name="id_mesa" value={formData.id_mesa} onChange={handleChange} required disabled={mesasDisponibles.length === 0}>
              <option value="">-- Seleccionar mesa --</option>
              {mesasDisponibles.map(mesa => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.id} {mesa.actual ? '(la actual)' : `(capacidad: ${mesa.capacidad})`}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary" onClick={buscarMesasLibres} disabled={cargandoMesas}>
              {cargandoMesas ? 'Buscando...' : 'Buscar mesas libres'}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Confirmar reserva'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
