// Hooks: carga inicial, agrupamiento eficiente de pedidos y estados de interfaz.
import { useEffect, useMemo, useState } from 'react';
// Iconos que representan las transiciones y los mensajes del KDS.
import { CheckCircle2, Clock3, Play, RefreshCw } from 'lucide-react';
// Servicio que consume exclusivamente los endpoints de Cocina.
import { actualizarEstado, getPedidosActivos } from '../../services/cocina.service';
// Datos del usuario logueado: solo un Cocinero puede cambiar el estado de los platos.
import { useAuth } from '../../context/AuthContext';

// Cada cuántos milisegundos se vuelven a pedir los pedidos (polling).
const INTERVALO_ACTUALIZACION = 15000;

// Máquina de estados de la pantalla: traduce el enum técnico del backend a textos, estilos y acciones.
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
  // El Administrador puede mirar la pantalla, pero los botones son solo para el Cocinero.
  const { usuario } = useAuth();
  const esCocinero = usuario?.rol === 'Cocinero';
  // Lista de detalles de comanda activos recibidos desde el backend.
  const [pedidos, setPedidos] = useState([]);
  // Estados usados para comunicar el resultado de las operaciones al cocinero.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  // Guarda la clave de la fila en proceso para deshabilitar solamente ese botón.
  const [actualizando, setActualizando] = useState(null);

  // Carga los pedidos al entrar a Cocina y después cada 15 segundos, para ver los pedidos nuevos.
  // La función que devuelve el useEffect se ejecuta al salir de la pantalla y frena el intervalo.
  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, INTERVALO_ACTUALIZACION);
    return () => clearInterval(intervalo);
  }, []);

  async function cargarPedidos() {
    // Se limpia un error anterior antes de realizar una nueva consulta.
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

  // Agrupa los detalles por id de mesa para que el KDS los muestre como tarjetas independientes.
  // useMemo evita recalcular el reduce si la lista pedidos no cambió.
  const pedidosPorMesa = useMemo(() => pedidos.reduce((mesas, pedido) => {
    const idMesa = pedido.comanda?.id_mesa ?? 'sin-mesa';
    if (!mesas[idMesa]) mesas[idMesa] = [];
    mesas[idMesa].push(pedido);
    return mesas;
  }, {}), [pedidos]);

  async function handleCambiarEstado(pedido) {
    // Busca cómo debe comportarse la fila según su estado actual.
    const configuracion = ESTADOS[pedido.estado];

    // Un pedido finalizado no tiene ninguna transición posterior.
    if (!configuracion?.siguienteEstado) return;

    // La clave compuesta identifica de forma única un detalle de comanda.
    const pedidoKey = `${pedido.idComanda}-${pedido.idProducto}`;
    setActualizando(pedidoKey);
    setFeedback('');
    setError('');

    try {
      // Envía IDs y el siguiente estado; el backend valida la transición nuevamente.
      // El cocinero no se manda: el backend lo toma del usuario logueado (token).
      await actualizarEstado({
        id_comanda: pedido.idComanda,
        id_producto: pedido.idProducto,
        estado: configuracion.siguienteEstado,
      });

      // Se informa el éxito y se recarga para reflejar el estado persistido.
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
      {/* Título de la pantalla y recarga manual de los pedidos activos. */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cocina KDS</h1>
          <p className="kds-subtitle">Gestioná los pedidos activos agrupados por mesa.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={cargarPedidos} disabled={loading}>
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {/* Estados informativos: carga, error y confirmación de actualización. */}
      {loading && pedidos.length === 0 && <p className="state-msg">Cargando pedidos activos...</p>}
      {error && <p className="state-msg state-error">{error}</p>}
      {feedback && <p className="state-msg state-success">{feedback}</p>}

      {/* Estado vacío cuando no hay detalles pendientes ni en preparación. */}
      {!loading && !error && pedidos.length === 0 && (
        <div className="kds-empty">
          <CheckCircle2 size={42} />
          <h2>No hay pedidos activos</h2>
          <p>Los pedidos pendientes o en preparación aparecerán aquí.</p>
        </div>
      )}

      {/* Una tarjeta por mesa; dentro se listan todos los productos de su comanda. */}
      {pedidos.length > 0 && (
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
                      // Se usa Pendiente como respaldo si llega un estado no contemplado.
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
                            {/* Solo los pedidos no finalizados conservan un botón de cambio de estado. */}
                            {!esCocinero ? (
                              <span className="text-muted">Solo el cocinero</span>
                            ) : configuracion.siguienteEstado ? (
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
