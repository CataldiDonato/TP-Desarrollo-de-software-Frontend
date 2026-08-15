import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChefHat, Clock3, Play, RefreshCw } from 'lucide-react';
import { actualizarEstado, getPedidosActivos } from '../../../services/cocina.service';

const ESTADOS = {
  Pendiente: {
    etiqueta: 'No arrancado',
    clase: 'kds-status-pending',
    siguienteEstado: 'En_Preparacion',
    accion: 'Iniciar preparación',
    icono: Play,
  },
  En_Preparacion: {
    etiqueta: 'En preparación',
    clase: 'kds-status-preparing',
    siguienteEstado: 'Finalizada',
    accion: 'Marcar como listo',
    icono: CheckCircle2,
  },
  Finalizada: {
    etiqueta: 'Listo',
    clase: 'kds-status-ready',
  },
};

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [idCocinero, setIdCocinero] = useState('');
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    setError('');

    try {
      const response = await getPedidosActivos();
      setPedidos(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los pedidos de Cocina.');
    } finally {
      setLoading(false);
    }
  }

  const pedidosPorMesa = useMemo(() => pedidos.reduce((mesas, pedido) => {
    const idMesa = pedido.comanda?.id_mesa ?? 'sin-mesa';
    if (!mesas[idMesa]) mesas[idMesa] = [];
    mesas[idMesa].push(pedido);
    return mesas;
  }, {}), [pedidos]);

  async function handleCambiarEstado(pedido) {
    const configuracion = ESTADOS[pedido.estado];
    const cocinero = Number(idCocinero);

    if (!configuracion?.siguienteEstado) return;

    if (!Number.isInteger(cocinero) || cocinero <= 0) {
      setFeedback('Ingresá un ID de cocinero válido antes de actualizar un pedido.');
      return;
    }

    const pedidoKey = `${pedido.idComanda}-${pedido.idProducto}`;
    setActualizando(pedidoKey);
    setFeedback('');
    setError('');

    try {
      await actualizarEstado({
        id_comanda: pedido.idComanda,
        id_producto: pedido.idProducto,
        estado: configuracion.siguienteEstado,
        id_cocinero: cocinero,
      });

      setFeedback(`Pedido actualizado a “${ESTADOS[configuracion.siguienteEstado].etiqueta}”.`);
      await cargarPedidos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizando(null);
    }
  }

  return (
    <section className="page-container cocina-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cocina KDS</h1>
          <p className="kds-subtitle">Gestioná los pedidos activos agrupados por mesa.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={cargarPedidos} disabled={loading}>
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      <div className="kds-toolbar">
        <ChefHat size={22} />
        <label htmlFor="id-cocinero">ID del cocinero que opera</label>
        <input
          id="id-cocinero"
          type="number"
          min="1"
          placeholder="Ej: 3"
          value={idCocinero}
          onChange={(event) => setIdCocinero(event.target.value)}
        />
      </div>

      {loading && <p className="state-msg">Cargando pedidos activos...</p>}
      {error && <p className="state-msg state-error">{error}</p>}
      {feedback && <p className="state-msg state-success">{feedback}</p>}

      {!loading && !error && pedidos.length === 0 && (
        <div className="kds-empty">
          <CheckCircle2 size={42} />
          <h2>No hay pedidos activos</h2>
          <p>Los pedidos pendientes o en preparación aparecerán aquí.</p>
        </div>
      )}

      {!loading && pedidos.length > 0 && (
        <div className="kds-grid">
          {Object.entries(pedidosPorMesa).map(([idMesa, pedidosMesa]) => (
            <article className="kds-mesa-card" key={idMesa}>
              <header className="kds-mesa-header">
                <h2>Mesa {idMesa}</h2>
                <span>Comanda #{pedidosMesa[0].idComanda}</span>
              </header>

              <div className="table-wrapper">
                <table className="data-table kds-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosMesa.map((pedido) => {
                      const configuracion = ESTADOS[pedido.estado] || ESTADOS.Pendiente;
                      const IconoAccion = configuracion.icono || Clock3;
                      const pedidoKey = `${pedido.idComanda}-${pedido.idProducto}`;
                      const procesando = actualizando === pedidoKey;

                      return (
                        <tr key={pedidoKey}>
                          <td><strong>{pedido.producto?.nombre || 'Producto sin nombre'}</strong></td>
                          <td>{pedido.cantidad}</td>
                          <td><span className={`kds-status ${configuracion.clase}`}>{configuracion.etiqueta}</span></td>
                          <td>
                            {configuracion.siguienteEstado ? (
                              <button
                                className="btn btn-primary kds-action"
                                type="button"
                                onClick={() => handleCambiarEstado(pedido)}
                                disabled={procesando}
                              >
                                <IconoAccion size={16} />
                                {procesando ? 'Actualizando...' : configuracion.accion}
                              </button>
                            ) : <span className="kds-done">Completado</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
