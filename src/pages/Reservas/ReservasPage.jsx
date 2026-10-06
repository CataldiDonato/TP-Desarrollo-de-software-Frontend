import { useState, useEffect } from 'react';
import { Ban, CheckCircle2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getReservas, deleteReserva, updateEstadoReserva } from '../../services/reservas.service';
import { formatearFecha, mensajeDeError } from '../../utils/formato';
import ReservaFormModal from './ReservaFormModal';
import CancelarReservaModal from './CancelarReservaModal';

export default function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Filtros: se aplican al tocar "Buscar" (el backend es el que filtra)
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservaAEditar, setReservaAEditar] = useState(null);
  const [reservaACancelar, setReservaACancelar] = useState(null);

  // Al entrar se muestran todas las reservas (sin filtros).
  useEffect(() => {
    cargarReservas({});
  }, []);

  // filtros: { cliente, fecha } (los dos opcionales)
  async function cargarReservas(filtros) {
    setCargando(true);
    try {
      const res = await getReservas(filtros);
      setReservas(res.data);
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al cargar las reservas'));
    } finally {
      setCargando(false);
    }
  }

  // Recarga usando los filtros que están escritos en pantalla.
  function recargar() {
    cargarReservas({ cliente: filtroCliente || undefined, fecha: filtroFecha || undefined });
  }

  function handleBuscar(event) {
    event.preventDefault();
    recargar();
  }

  function abrirNueva() {
    setReservaAEditar(null);
    setModalAbierto(true);
  }

  function abrirEdicion(reserva) {
    setReservaAEditar(reserva);
    setModalAbierto(true);
  }

  async function handleConfirmar(reserva) {
    try {
      await updateEstadoReserva(reserva.id, { estado: 'Confirmada' });
      toast.success('La reserva volvió a quedar confirmada');
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al confirmar la reserva'));
    }
  }

  async function handleEliminar(reserva) {
    if (!window.confirm(`¿Eliminar la reserva de ${reserva.nombre_cliente}? Se borra del sistema.`)) return;
    try {
      await deleteReserva(reserva.id);
      toast.success('Reserva eliminada');
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al eliminar la reserva'));
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reservas</h1>
        <button className="btn btn-primary" onClick={abrirNueva}>
          <Plus size={18} /> Nueva reserva
        </button>
      </div>

      {/* Filtros por cliente y por día */}
      <form className="filter-bar" onSubmit={handleBuscar}>
        <input
          className="filter-input"
          type="text"
          placeholder="Nombre del cliente..."
          value={filtroCliente}
          onChange={(event) => setFiltroCliente(event.target.value)}
        />
        <input
          className="filter-input"
          type="date"
          value={filtroFecha}
          onChange={(event) => setFiltroFecha(event.target.value)}
        />
        <button className="btn btn-secondary" type="submit">
          <Search size={16} /> Buscar
        </button>
      </form>

      {cargando ? (
        <p className="state-msg">Cargando reservas...</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha y hora</th>
                <th>Teléfono</th>
                <th>Personas</th>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr><td colSpan="7" className="table-empty">No hay reservas para mostrar.</td></tr>
              ) : reservas.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.nombre_cliente}</strong></td>
                  <td>{formatearFecha(r.fecha)}</td>
                  <td>{r.telefono_cliente}</td>
                  <td>{r.cantidad_personas}</td>
                  <td>Mesa {r.id_mesa}</td>
                  <td>
                    <span className={`badge estado-${r.estado.toLowerCase()}`}>{r.estado}</span>
                    {r.motivo_cancelacion && <div className="text-muted text-small">({r.motivo_cancelacion})</div>}
                  </td>
                  <td className="table-actions">
                    {r.estado === 'Confirmada' ? (
                      <>
                        <button className="btn btn-icon btn-edit" onClick={() => abrirEdicion(r)} title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button className="btn btn-icon btn-delete" onClick={() => setReservaACancelar(r)} title="Cancelar reserva">
                          <Ban size={16} />
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-icon btn-edit" onClick={() => handleConfirmar(r)} title="Volver a confirmar">
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button className="btn btn-icon btn-delete" onClick={() => handleEliminar(r)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <ReservaFormModal
          reservaInicial={reservaAEditar}
          onGuardado={() => {
            setModalAbierto(false);
            recargar();
          }}
          onCancelar={() => setModalAbierto(false)}
        />
      )}

      {reservaACancelar && (
        <CancelarReservaModal
          reserva={reservaACancelar}
          onGuardado={() => {
            setReservaACancelar(null);
            recargar();
          }}
          onCancelar={() => setReservaACancelar(null)}
        />
      )}
    </div>
  );
}
