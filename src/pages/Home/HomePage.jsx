// useEffect ejecuta la carga inicial; useState conserva los datos y estados de la vista.
import { useEffect, useState } from 'react';
// Iconos reutilizables para que cada indicador sea fácil de identificar visualmente.
import { CalendarDays, ChefHat, CircleDollarSign, LayoutList, RefreshCw, Utensils } from 'lucide-react';
// Servicios que encapsulan las llamadas HTTP de este módulo.
import { getDashboardStats, getMesasActivas } from '../../services/dashboard.service';

// Formateadores creados una sola vez fuera del componente para no reconstruirlos en cada render.
const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const fechaHora = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export default function HomePage() {
  // Respuesta de /dashboard/stats: ventas, pedidos en cocina y reservas próximas.
  const [estadisticas, setEstadisticas] = useState(null);
  // Comandas abiertas, usadas para construir la tabla de mesas activas.
  const [mesasActivas, setMesasActivas] = useState([]);
  // Estados de interfaz para informar carga y errores sin dejar la pantalla vacía.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Al montar Home se obtiene la información necesaria por primera vez.
  useEffect(() => {
    cargarDashboard();
  }, []);

  // Consulta los dos recursos en paralelo: así Home espera una sola vez y carga más rápido.
  async function cargarDashboard() {
    setCargando(true);
    setError('');
    try {
      const [respuesta, respuestaComandas] = await Promise.all([getDashboardStats(), getMesasActivas()]);
      setEstadisticas(respuesta.data);
      // Una mesa está activa si posee una comanda cuyo estado continúa Abierta.
      setMesasActivas(respuestaComandas.data.filter((comanda) => comanda.estado === 'Abierta'));
    } catch (err) {
      // Se prioriza el mensaje del backend, pero se mantiene uno genérico como respaldo.
      setError(err.response?.data?.message || 'No se pudo cargar el dashboard.');
    } finally {
      // finally se ejecuta tanto si la consulta funciona como si falla.
      setCargando(false);
    }
  }

  // Evita errores mientras las estadísticas todavía son null y garantiza un arreglo al renderizar.
  const reservas = estadisticas?.proximasReservas ?? [];

  // Configuración declarativa de las tarjetas: map permite dibujar las cuatro sin repetir JSX.
  const metricas = [
    { titulo: 'Salón', valor: estadisticas ? `${estadisticas.mesasOcupadas ?? 0} ocupadas` : '—', detalle: 'Mesas con comanda abierta', icono: Utensils, clase: 'metric-salon' },
    { titulo: 'Ventas del día', valor: estadisticas ? moneda.format(estadisticas.ventasDelDia ?? 0) : '—', detalle: `${estadisticas?.comandasPagadas ?? 0} comandas cobradas`, icono: CircleDollarSign, clase: 'metric-sales' },
    { titulo: 'En cocina', valor: estadisticas ? estadisticas.pedidosEnCocina ?? 0 : '—', detalle: 'Pedidos pendientes o en preparación', icono: ChefHat, clase: 'metric-kitchen' },
    { titulo: 'Próximas reservas', valor: estadisticas ? reservas.length : '—', detalle: 'Reservas confirmadas', icono: CalendarDays, clase: 'metric-reservations' },
  ];

  return (
    // Contenedor general que hereda los estilos compartidos de todas las páginas.
    <section className="page-container home-page">
      {/* Encabezado y acción manual para volver a consultar los datos. */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Resumen del restaurante</h1>
          <p className="page-subtitle">Información operativa actualizada al momento.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={cargarDashboard} disabled={cargando}>
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {/* Estados transitorios: no se muestran las tablas mientras carga o hay un error. */}
      {cargando && <p className="state-msg">Cargando indicadores...</p>}
      {error && <p className="state-msg state-error">{error}</p>}

      {!cargando && !error && <>
        {/* Tarjetas de métricas; Icono recibe el componente de lucide definido en cada objeto. */}
        <div className="metrics-grid">
          {metricas.map(({ titulo, valor, detalle, icono: Icono, clase }) => (
            <article className={`metric-card ${clase}`} key={titulo}>
              <div className="metric-icon"><Icono size={21} /></div>
              <div><p>{titulo}</p><strong>{valor}</strong><span>{detalle}</span></div>
            </article>
          ))}
        </div>

        {/* Resúmenes operativos solicitados: comandas abiertas y reservas confirmadas. */}
        <div className="home-tables">
          <article className="dashboard-panel">
            <header className="dashboard-panel-header"><LayoutList size={19} /><h2>Mesas activas</h2></header>
            {/* Para cada comanda abierta se muestra la mesa, su número y la hora de apertura. */}
            {mesasActivas.length ? (
              <div className="table-wrapper"><table className="data-table compact-table"><thead><tr><th>Mesa</th><th>Comanda</th><th>Hora</th></tr></thead><tbody>
                {mesasActivas.map((comanda) => <tr key={comanda.id}><td>Mesa {comanda.id_mesa}</td><td>#{comanda.id}</td><td>{comanda.fecha ? fechaHora.format(new Date(comanda.fecha)) : '—'}</td></tr>)}
              </tbody></table></div>
            ) : <p className="panel-empty">No hay mesas activas para mostrar.</p>}
          </article>

          <article className="dashboard-panel">
            <header className="dashboard-panel-header"><CalendarDays size={19} /><h2>Próximas reservas</h2></header>
            {/* Cada reserva puede tener más de una mesa; por eso se unen sus IDs con coma. */}
            {reservas.length ? (
              <div className="table-wrapper"><table className="data-table compact-table"><thead><tr><th>Cliente</th><th>Fecha</th><th>Mesa</th></tr></thead><tbody>
                {reservas.map((reserva) => <tr key={reserva.id}><td><strong>{reserva.nombre_cliente}</strong></td><td>{fechaHora.format(new Date(reserva.fecha))}</td><td>{reserva.mesas?.length ? reserva.mesas.map((mesa) => mesa.id).join(', ') : 'A asignar'}</td></tr>)}
              </tbody></table></div>
            ) : <p className="panel-empty">No hay reservas confirmadas próximas.</p>}
          </article>
        </div>
      </>}
    </section>
  );
}
