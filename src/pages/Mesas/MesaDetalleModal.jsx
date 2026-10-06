import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { getMesa } from '../../services/mesas.service';
import { formatearFecha, mensajeDeError } from '../../utils/formato';

/**
 * Detalle de una mesa (lo pide al backend): estado, comanda abierta con sus productos
 * y próximas reservas.
 */
export default function MesaDetalleModal({ idMesa, onCerrar }) {
  const [mesa, setMesa] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMesa(idMesa);
  }, [idMesa]);

  async function cargarMesa(id) {
    try {
      const respuesta = await getMesa(id);
      setMesa(respuesta.data);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cargar el detalle de la mesa.'));
    }
  }

  return (
    <Modal titulo={`Mesa ${idMesa}`} onCerrar={onCerrar}>
      <div className="modal-body">
        {!mesa && !error && <p className="state-msg">Cargando...</p>}
        {error && <p className="state-msg state-error">{error}</p>}

        {mesa && (
          <>
            <p>
              <strong>Capacidad:</strong> {mesa.capacidad} personas ·{' '}
              <span className={`badge estado-${mesa.estado.toLowerCase()}`}>{mesa.estado}</span>
            </p>

            <h3>Comanda activa</h3>
            {mesa.comandaActiva ? (
              <>
                <p className="text-muted">
                  Comanda #{mesa.comandaActiva.id} · Mozo: {mesa.comandaActiva.mozo.nombre} · Abierta: {formatearFecha(mesa.comandaActiva.fecha)}
                </p>
                <ul className="lista-simple">
                  {mesa.comandaActiva.detalles_comandas.map((detalle) => (
                    <li key={detalle.id_producto}>
                      {detalle.cantidad} x {detalle.producto.nombre} <span className="text-muted">({detalle.estado.replace('_', ' ')})</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted">No tiene comanda abierta.</p>
            )}

            <h3>Próximas reservas</h3>
            {mesa.proximasReservas.length > 0 ? (
              <ul className="lista-simple">
                {mesa.proximasReservas.map((reserva) => (
                  <li key={reserva.id}>
                    {formatearFecha(reserva.fecha)} · {reserva.nombre_cliente} ({reserva.cantidad_personas} personas)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No tiene reservas próximas.</p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
