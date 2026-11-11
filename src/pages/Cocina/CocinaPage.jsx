// Hooks: carga inicial, agrupamiento eficiente de pedidos y estados de interfaz.
import { useEffect, useMemo, useState } from 'react';
// Iconos que representan las transiciones y los mensajes del KDS.
import { CheckCircle2, Clock3, Eye, Play, RefreshCw } from 'lucide-react';
// Servicio que consume exclusivamente los endpoints de Cocina.
import { actualizarEstado, getPedidosActivos } from '../../services/cocina.service';
// Datos del usuario logueado: solo un Cocinero puede cambiar el estado de los platos.
import { useAuth } from '../../context/AuthContext';
import DetalleComandaCocinaModal from './DetalleComandaCocinaModal';

// Cada cuántos milisegundos se vuelven a pedir los pedidos (polling).
const INTERVALO_ACTUALIZACION = 15000;

// Opciones del filtro: '' = todos los pedidos activos.
const FILTROS = [
  { valor: '', etiqueta: 'Todos los pedidos activos' },
  { valor: 'Pendiente', etiqueta: 'Solo pendientes' },
  { valor: 'En_Preparacion', etiqueta: 'Solo en preparación' },
];

// Texto e icono del botón según el estado al que pasa el pedido.
const ACCIONES = {
  En_Preparacion: { texto: 'Iniciar preparación', icono: Play },
  Finalizada: { texto: 'Marcar como listo', icono: CheckCircle2 },
};

export default function CocinaPage() {
  // El Administrador puede mirar la pantalla, pero los botones son solo para el Cocinero.
  const { usuario } = useAuth();
  const esCocinero = usuario?.rol === 'Cocinero';
  // Pedidos activos recibidos del backend (instancias de PedidoCocina).
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  // Estados usados para comunicar el resultado de las operaciones al cocinero.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  // Guarda la clave de la fila en proceso para deshabilitar solamente ese botón.
  const [actualizando, setActualizando] = useState(null);
  // Id de la comanda que se muestra en el modal de detalle.
  const [comandaDetalle, setComandaDetalle] = useState(null);

  // Carga los pedidos al entrar a Cocina, cuando cambia el filtro y después cada 15 segundos.
  // La función que devuelve el useEffect se ejecuta al salir de la pantalla y frena el intervalo.
  useEffect(() => {
    cargarPedidos(filtroEstado);
    const intervalo = setInterval(() => cargarPedidos(filtroEstado), INTERVALO_ACTUALIZACION);
    return () => clearInterval(intervalo);
  }, [filtroEstado])

  async function cargarPedidos(estado) {
    // Se limpia un error anterior antes de realizar una nueva consulta.
    setLoading(true);
    setError('');

    try {
      const response = await getPedidosActivos(estado || undefined);
      setPedidos(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los pedidos de Cocina.');
    } finally {
      setLoading(false);
    }
  }

  // Agrupa los pedidos por comanda para que el KDS los muestre como tarjetas independientes.
  // useMemo evita recalcular el reduce si la lista pedidos no cambió.
  const pedidosPorComanda = useMemo(() => pedidos.reduce((comandas, pedido) => {
    if (!comandas[pedido.idComanda]) comandas[pedido.idComanda] = [];
    comandas[pedido.idComanda].push(pedido);
    return comandas;
  }, {}), [pedidos]);

  async function handleCambiarEstado(pedido) {
    // Un pedido finalizado no tiene ninguna transición posterior.
    if (!pedido.siguienteEstado) return;

    setActualizando(pedido.clave);
    setFeedback('');
    setError('');

    try {
      // Envía IDs y el siguiente estado; el backend valida la transición nuevamente.
      // El cocinero no se manda: el backend lo toma del usuario logueado (token).
      await actualizarEstado({
        id_comanda: pedido.idComanda,
        id_producto: pedido.idProducto,
        estado: pedido.siguienteEstado,
      });

      // Se informa el éxito y se recarga para reflejar el estado persistido.
      setFeedback(`“${pedido.producto?.nombre}” actualizado.`);
      await cargarPedidos(filtroEstado);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizando(null);
    }
  }

  return (
    <section className="page-container gap-5">
      {/* Título de la pantalla y recarga manual de los pedidos activos. */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cocina KDS</h1>
          <p className="page-subtitle">Gestioná los pedidos activos agrupados por comanda.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => cargarPedidos(filtroEstado)} disabled={loading}>
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {/* Filtro por estado: el backend devuelve solo los pedidos de ese estado. */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={filtroEstado}
          onChange={(event) => setFiltroEstado(event.target.value)}
          aria-label="Filtrar por estado"
        >
          {FILTROS.map(({ valor, etiqueta }) => <option key={valor} value={valor}>{etiqueta}</option>)}
        </select>
      </div>

      {/* Estados informativos: carga, error y confirmación de actualización. */}
      {loading && pedidos.length === 0 && <p className="state-msg">Cargando pedidos activos...</p>}
      {error && <p className="state-msg state-error">{error}</p>}
      {feedback && <p className="state-msg state-success">{feedback}</p>}

      {/* Estado vacío cuando no hay pedidos para el filtro elegido. */}
      {!loading && !error && pedidos.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 rounded-[10px] border border-dashed border-border px-4 py-16 text-center text-muted">
          <CheckCircle2 size={42} className="text-success" />
          <h2 className="text-fg">No hay pedidos para mostrar</h2>
          <p>Los pedidos pendientes o en preparación aparecerán aquí.</p>
        </div>
      )}

      {/* Una tarjeta por comanda; dentro se listan sus productos activos. */}
      {pedidos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(420px,1fr))]">
          {Object.entries(pedidosPorComanda).map(([idComanda, pedidosComanda]) => (
            <article className="card overflow-hidden" key={idComanda}>
              <header className="flex flex-col justify-between gap-2 border-b border-border bg-surface-2 px-5 py-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg">Mesa {pedidosComanda[0].idMesa}</h2>
                  <span className="text-sm text-muted">Comanda #{idComanda}</span>
                </div>
                <button className="btn btn-secondary px-3 py-1.5 text-xs" type="button" onClick={() => setComandaDetalle(Number(idComanda))}>
                  <Eye size={14} /> Ver detalle
                </button>
              </header>

              <div className="overflow-x-auto">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosComanda.map((pedido) => {
                      const accion = ACCIONES[pedido.siguienteEstado];
                      const IconoAccion = accion?.icono || Clock3;
                      const procesando = actualizando === pedido.clave;

                      return (
                        <tr key={pedido.clave}>
                          <td>
                            <strong>{pedido.producto?.nombre || 'Producto sin nombre'}</strong>
                            {pedido.observaciones && <span className="block text-xs text-warning">Obs.: {pedido.observaciones}</span>}
                          </td>
                          <td>{pedido.cantidad}</td>
                          <td><span className={`badge ${pedido.claseEstado}`}>{pedido.estadoLegible}</span></td>
                          <td>
                            {/* Solo los pedidos no finalizados conservan un botón de cambio de estado. */}
                            {!esCocinero ? (
                              <span className="text-muted">Solo el cocinero</span>
                            ) : accion ? (
                              <button
                                className="btn btn-primary px-3 py-1.5 text-xs whitespace-nowrap"
                                type="button"
                                onClick={() => handleCambiarEstado(pedido)}
                                disabled={procesando}
                              >
                                <IconoAccion size={16} />
                                {procesando ? 'Actualizando...' : accion.texto}
                              </button>
                            ) : <span className="font-semibold text-success">Completado</span>}
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

      {comandaDetalle && (
        <DetalleComandaCocinaModal idComanda={comandaDetalle} onCerrar={() => setComandaDetalle(null)} />
      )}
    </section>
  );
}
