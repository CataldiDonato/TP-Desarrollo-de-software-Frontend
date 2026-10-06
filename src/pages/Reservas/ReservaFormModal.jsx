import { useState } from 'react';
import { createReserva } from '../../services/reservas.service';
import { getMesasDisponibles } from '../../services/mesas.service';
import toast from 'react-hot-toast';

export default function ReservaFormModal({ onGuardado, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono_cliente: '',
    fecha: '',
    cantidad_personas: '',
    id_mesa: ''
  });
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [cargando, setCargando] = useState(false);

  const fetchMesasDisponibles = async () => {
    setCargandoMesas(true);
    try {
      const res = await getMesasDisponibles();
      setMesasDisponibles(res.data);
      if (res.data.length === 0) {
        toast.error('No hay mesas disponibles en este momento');
      } else {
        toast.success(`Se encontraron ${res.data.length} mesas libres`);
      }
    } catch (error) {
      toast.error('Error al buscar mesas libres');
    } finally {
      setCargandoMesas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_mesa) {
      return toast.error('Debes buscar y seleccionar una mesa disponible');
    }
    
    setCargando(true);
    try {
      // Formatear datos antes de enviarlos (fecha ISO y enteros)
      const dataAEnviar = {
        ...formData,
        fecha: new Date(formData.fecha).toISOString(),
        cantidad_personas: parseInt(formData.cantidad_personas),
        id_mesa: parseInt(formData.id_mesa)
      };
      
      await createReserva(dataAEnviar);
      toast.success('Reserva confirmada con éxito');
      onGuardado();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la reserva');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Nueva Reserva</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input name="telefono_cliente" type="tel" value={formData.telefono_cliente} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha y Hora</label>
            <input type="datetime-local" name="fecha" value={formData.fecha} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Cantidad de Personas</label>
            <input type="number" name="cantidad_personas" min="1" value={formData.cantidad_personas} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Asignar Mesa</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select name="id_mesa" value={formData.id_mesa} onChange={handleChange} required disabled={mesasDisponibles.length === 0} style={{ flexGrow: 1 }}>
                <option value="">-- Seleccionar Mesa --</option>
                {mesasDisponibles.map(mesa => (
                  <option key={mesa.id} value={mesa.id}>
                    Mesa {mesa.id} (Capacidad: {mesa.capacidad})
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-secondary" onClick={fetchMesasDisponibles} disabled={cargandoMesas}>
                {cargandoMesas ? 'Buscando...' : 'Buscar Mesas Libres'}
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
