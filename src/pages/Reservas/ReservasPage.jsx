import { useState, useEffect } from 'react';
import { getReservas, deleteReserva, updateEstadoReserva } from '../../services/reservas.service';
import ReservaFormModal from './ReservaFormModal';
import toast from 'react-hot-toast';

export default function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await getReservas();
      setReservas(res.data);
    } catch (err) {
      toast.error('Error al cargar las reservas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCancelarReserva = async (id) => {
    const motivo = prompt('Por favor, ingresa el motivo de la cancelación:');
    if (motivo === null) return; 
    try {
      await updateEstadoReserva(id, { estado: 'Cancelada', motivo_cancelacion: motivo });
      toast.success('La reserva fue cancelada');
      cargarDatos();
    } catch (err) {
      toast.error('Error al cancelar la reserva');
    }
  };

  const handleFinalizarReserva = async (id) => {
    if (!confirm('¿Confirmas que la reserva se completó y deseas finalizarla (eliminarla de la tabla)?')) return;
    try {
      await deleteReserva(id);
      toast.success('Reserva finalizada y liberada');
      cargarDatos();
    } catch (err) {
      toast.error('Error al finalizar la reserva');
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Reservas</h1>
        <button className="btn btn-primary" onClick={() => setModalAbierto(true)}>
          + Nueva Reserva
        </button>
      </div>

      {cargando ? (
        <p>Cargando reservas...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha y Hora</th>
              <th>Teléfono</th>
              <th>Personas</th>
              <th>Mesa Asignada</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id}>
                <td>{r.nombre_cliente}</td>
                <td>{formatearFecha(r.fecha)}</td>
                <td>{r.telefono_cliente}</td>
                <td>{r.cantidad_personas} pax</td>
                <td>Mesa N° {r.id_mesa}</td>
                <td>
                  <span className={`badge estado-${r.estado.toLowerCase()}`}>
                    {r.estado}
                  </span>
                  {r.motivo_cancelacion && (
                    <div style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
                      ({r.motivo_cancelacion})
                    </div>
                  )}
                </td>
                <td>
                  {r.estado !== 'Cancelada' && (
                    <button className="btn-icon" onClick={() => handleCancelarReserva(r.id)} title="Cancelar Reserva">
                      ❌
                    </button>
                  )}
                  <button className="btn-icon text-success" onClick={() => handleFinalizarReserva(r.id)} title="Finalizar Reserva">
                    ✅
                  </button>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No hay reservas agendadas.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalAbierto && (
        <ReservaFormModal
          onGuardado={() => {
            setModalAbierto(false);
            cargarDatos();
          }}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
