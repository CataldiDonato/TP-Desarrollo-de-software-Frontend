import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getComandas } from '../../services/comandas.service';
import { ESTADOS_COMANDA } from '../../models/modelos';
import { formatearFecha, formatearPrecio, mensajeDeError } from '../../utils/formato';
import DetalleComandaModal from './DetalleComandaModal';

const ComandasPage = () => {
  const navigate = useNavigate();
  // Comandas obtenidas del backend
  const [comandas, setComandas] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Por defecto se muestran las abiertas, que son las que el mozo está atendiendo
  const [filtroEstado, setFiltroEstado] = useState('Abierta');
  // Id de la comanda que se abre en el modal de detalle
  const [comandaSeleccionada, setComandaSeleccionada] = useState(null);

  // Se vuelve a pedir el listado cada vez que cambia el filtro (el backend filtra por estado).
  useEffect(() => {
    cargarComandas(filtroEstado);
  }, [filtroEstado]);

  async function cargarComandas(estado) {
    setCargando(true);
    try {
      const response = await getComandas(estado || undefined);
      setComandas(response.data);
    } catch (error) {
      toast.error(mensajeDeError(error, 'Error al obtener las comandas'));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Comandas</h1>
        <button className="btn btn-primary" onClick={() => navigate('/comandas/nueva')}>
          <Plus size={18} /> Nueva comanda
        </button>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todas</option>
          {ESTADOS_COMANDA.map((estado) => <option key={estado} value={estado}>{estado}s</option>)}
        </select>
      </div>

      {cargando ? (
        <p className="state-msg">Cargando comandas...</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Mozo</th>
                <th>Medio de pago</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comandas.length === 0 ? (
                <tr><td colSpan="7" className="table-empty">No hay comandas para mostrar.</td></tr>
              ) : comandas.map((comanda) => (
                <tr key={comanda.id}>
                  <td><strong>Mesa {comanda.id_mesa}</strong></td>
                  <td>{comanda.mozo.nombre}</td>
                  <td>{comanda.medio_pago ? comanda.medio_pago.tipo : '—'}</td>
                  <td>{formatearPrecio(comanda.total)}</td>
                  <td>{formatearFecha(comanda.fecha)}</td>
                  <td><span className={`badge estado-${comanda.estado.toLowerCase()}`}>{comanda.estado}</span></td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => setComandaSeleccionada(comanda.id)}>
                      <Eye size={16} /> Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {comandaSeleccionada && (
        <DetalleComandaModal
          idComanda={comandaSeleccionada}
          onCerrar={() => setComandaSeleccionada(null)}
          onCambio={() => cargarComandas(filtroEstado)}
        />
      )}
    </div>
  );
};

export default ComandasPage;
