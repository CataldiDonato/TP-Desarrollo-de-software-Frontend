import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { getComandaCocina } from '../../services/cocina.service';
import { formatearFecha, mensajeDeError } from '../../utils/formato';

/**
 * Detalle de una comanda para la cocina (lo pide al backend): mesa, mozo, hora de apertura
 * y todos sus productos, incluidos los ya terminados, con sus observaciones y quién los preparó.
 *
 * Props:
 *  - idComanda: comanda a mostrar
 *  - onCerrar: cierra el modal
 */
export default function DetalleComandaCocinaModal({ idComanda, onCerrar }) {
  const [comanda, setComanda] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarComanda(idComanda);
  }, [idComanda]);

  async function cargarComanda(id) {
    try {
      const respuesta = await getComandaCocina(id);
      setComanda(respuesta.data);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cargar el detalle de la comanda.'));
    }
  }

  return (
    <Modal titulo={`Comanda #${idComanda}`} onCerrar={onCerrar}>
      <div className="modal-body">
        {!comanda && !error && <p className="state-msg">Cargando...</p>}
        {error && <p className="state-msg state-error">{error}</p>}

        {comanda && (
          <>
            <p className="text-muted">
              Mesa {comanda.mesa.id} ({comanda.mesa.capacidad} personas) · Mozo: {comanda.mozo.nombre} · Abierta: {formatearFecha(comanda.fecha)}
            </p>
            <p>
              <strong>Avance:</strong> {comanda.cantidadListos} de {comanda.detalles.length} productos listos
            </p>

            <div className="table-wrapper shadow-none">
              <table className="data-table compact-table">
                <thead>
                  <tr><th>Producto</th><th>Cant.</th><th>Estado</th><th>Cocinero</th></tr>
                </thead>
                <tbody>
                  {comanda.detalles.map((detalle) => (
                    <tr key={detalle.id_producto}>
                      <td>
                        {detalle.nombre_producto} <span className="text-xs text-muted">({detalle.tipo})</span>
                        {detalle.observaciones && <span className="block text-xs text-warning">Obs.: {detalle.observaciones}</span>}
                      </td>
                      <td>{detalle.cantidad}</td>
                      <td><span className={`badge estado-${detalle.estado.toLowerCase()}`}>{detalle.estadoLegible}</span></td>
                      <td>{detalle.cocinero?.nombre ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
