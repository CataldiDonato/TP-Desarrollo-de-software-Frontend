import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { createReserva, updateReserva } from '../../services/reservas.service';
import { getMesasDisponibles } from '../../services/mesas.service';
import { mensajeDeError } from '../../utils/formato';
import { fechaReservaAUTC, fechaReservaParaInput } from '../../utils/fechaReserva';
import { Reserva } from '../../models/modelos';

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
    fecha: esEdicion ? fechaReservaParaInput(reservaInicial.fecha) : '',
    cantidad_personas: esEdicion ? reservaInicial.cantidad_personas : '',
    id_mesa: esEdicion ? reservaInicial.id_mesa : ''
  });
  // Al editar, la mesa actual aparece en el desplegable aunque no se haya buscado.
  const [mesasDisponibles, setMesasDisponibles] = useState(
    esEdicion ? [{ id: reservaInicial.id_mesa, actual: true }] : []
  );
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [cargando, setCargando] = useState(false);
  const busquedaActual = useRef(0);

  const instanteReserva = () => esEdicion && formData.fecha === fechaReservaParaInput(reservaInicial.fecha)
    ? new Date(reservaInicial.fecha).toISOString()
    : fechaReservaAUTC(formData.fecha);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fecha' || name === 'cantidad_personas') {
      busquedaActual.current += 1;
      setMesasDisponibles([]);
      setCargandoMesas(false);
      setFormData(prev => ({ ...prev, [name]: value, id_mesa: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const buscarMesasLibres = async () => {
    if (!formData.fecha || !formData.cantidad_personas) {
      toast.error('Primero completá la fecha y la cantidad de personas');
      return;
    }

    setCargandoMesas(true);
    const busqueda = ++busquedaActual.current;
    try {
      const fechaISO = instanteReserva();
      const res = await getMesasDisponibles(fechaISO, formData.cantidad_personas, reservaInicial?.id);
      if (busqueda !== busquedaActual.current) return;
      setMesasDisponibles(res.data);
      setFormData(prev => ({ ...prev, id_mesa: '' }));
      if (res.data.length === 0) {
        toast.error('No hay mesas disponibles para ese horario');
      } else {
        toast.success(`Se encontraron ${res.data.length} mesas disponibles`);
      }
    } catch (error) {
      if (busqueda === busquedaActual.current) toast.error(mensajeDeError(error, error.message || 'Error al buscar mesas libres'));
    } finally {
      if (busqueda === busquedaActual.current) setCargandoMesas(false);
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
      const dataAEnviar = new Reserva({ ...formData, fecha: instanteReserva() }).toApi();

      if (esEdicion) {
        await updateReserva(reservaInicial.id, dataAEnviar);
        toast.success('Reserva actualizada');
      } else {
        await createReserva(dataAEnviar);
        toast.success('Reserva confirmada con éxito');
      }
      onGuardado();
    } catch (error) {
      toast.error(mensajeDeError(error, error.message || 'Error al guardar la reserva'));
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
