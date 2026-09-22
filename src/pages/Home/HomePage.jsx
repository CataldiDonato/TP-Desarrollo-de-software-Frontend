import { useState, useEffect } from 'react';
import { getStats } from '../../services/home.service'; // Asegúrate de crear este service

export default function HomePage() {
  // 1. ESTADO GENERAL CON VALORES INICIALES POR DEFECTO
  const [stats, setStats] = useState({
    mesasOcupadas: 0,
    mesasTotal: 0,
    ventasHoy: 0,
    pedidosEnPreparacion: 0,
    pedidosSinArrancar: 0,
    totalReservas: 0,
    mesas: [],
    reservas: []
  });

  const [cargando, setCargando] = useState(true);

  // 2. CARGA DE DATOS DEL BACKEND
  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (error) {
        console.error('Error al cargar métricas del dashboard:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  if (cargando) return <p className="page-container">Cargando métricas del día...</p>;

  return (
    <div className="page-container">
      {/* SECCIÓN SUPERIOR: TARJETAS DE MÉTRICAS */}
      <div className="dashboard-cards-grid">
        {/* Tarjeta 1: Salón */}
        <div className="stat-card">
          <h3>Estado salón</h3>
          <h2>{stats.mesasOcupadas} / {stats.mesasTotal} mesas</h2>
          <p>{stats.mesasTotal - stats.mesasOcupadas} mesas disponibles</p>
        </div>

        {/* Tarjeta 2: Ventas */}
        <div className="stat-card">
          <h3>Ventas de hoy</h3>
          <h2 className="text-success">${stats.ventasHoy.toLocaleString('es-AR')}</h2>
        </div>

        {/* Tarjeta 3: Cocina */}
        <div className="stat-card">
          <h3>En cocina</h3>
          <ul>
            <li><strong>{stats.pedidosEnPreparacion}</strong> Pedidos (en preparación)</li>
            <li><strong>{stats.pedidosSinArrancar}</strong> Requieren atención (sin arrancar)</li>
          </ul>
        </div>

        {/* Tarjeta 4: Reservas */}
        <div className="stat-card">
          <h3>Reservas de hoy</h3>
          <h2>{stats.totalReservas}</h2>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: TABLAS DE RESUMEN */}
      <div className="dashboard-tables-grid">
        {/* Tabla Mesas Activas */}
        <div className="table-container">
          <h3>Mesas activas</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.mesas.length === 0 ? (
                <tr>
                  <td colSpan="2">No hay mesas registradas.</td>
                </tr>
              ) : (
                stats.mesas.map((m) => (
                  <tr key={m.id}>
                    <td>Mesa {m.numero || m.id}</td>
                    <td>
                      <span className={`badge ${m.estado === 'Ocupada' ? 'badge-danger' : 'badge-success'}`}>
                        {m.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tabla Próximas Reservas */}
        <div className="table-container">
          <h3>Próximas reservas del día</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Nombre Cliente</th>
              </tr>
            </thead>
            <tbody>
              {stats.reservas.length === 0 ? (
                <tr>
                  <td colSpan="2">No hay reservas para hoy.</td>
                </tr>
              ) : (
                stats.reservas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.hora || r.fecha}</td>
                    <td>{r.nombre_cliente}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}