import { useState, useEffect } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMesas, deleteMesa } from '../../services/mesas.service';
import { useAuth } from '../../context/AuthContext';
import { ESTADOS_MESA } from '../../models/modelos';
import { mensajeDeError } from '../../utils/formato';
import MesaFormModal from './MesaFormModal';
import MesaDetalleModal from './MesaDetalleModal';

export default function MesasPage() {
  // El Mozo puede ver las mesas y su detalle; solo el Administrador las crea, edita o borra.
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'Administrador';

  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(''); // '' = todas
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState(null);
  const [mesaDetalle, setMesaDetalle] = useState(null); // id de la mesa que se muestra en el detalle

  // Se vuelve a pedir el listado cada vez que cambia el filtro (el backend filtra por estado).
  useEffect(() => {
    cargarMesas(filtroEstado);
  }, [filtroEstado]);

  async function cargarMesas(estado) {
    setCargando(true);
    setError('');
    try {
      const respuesta = await getMesas(estado || undefined);
      setMesas(respuesta.data);
    } catch (err) {
      setError(mensajeDeError(err, 'Error al cargar las mesas.'));
    } finally {
      setCargando(false);
    }
  }

  function abrirNueva() {
    setMesaAEditar(null);
    setModalAbierto(true);
  }

  function abrirEdicion(mesa) {
    setMesaAEditar(mesa);
    setModalAbierto(true);
  }

  async function handleEliminar(mesa) {
    if (!window.confirm(`¿Seguro que deseas eliminar la mesa ${mesa.id}?`)) return;
    try {
      await deleteMesa(mesa.id);
      toast.success('Mesa eliminada');
      cargarMesas(filtroEstado);
    } catch (err) {
      toast.error(mensajeDeError(err, 'Error al eliminar la mesa'));
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mesas</h1>
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirNueva}>
            <Plus size={18} /> Nueva mesa
          </button>
        )}
      </div>

      {/* Filtro por disponibilidad */}
      <div className="filter-bar">
        <select className="filter-select" value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_MESA.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
        </select>
      </div>

      {cargando && <p className="state-msg">Cargando mesas...</p>}
      {error && <p className="state-msg state-error">{error}</p>}

      {!cargando && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Mesa</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mesas.length === 0 ? (
                <tr><td colSpan="4" className="table-empty">No hay mesas para mostrar.</td></tr>
              ) : mesas.map((mesa) => (
                <tr key={mesa.id}>
                  <td><strong>{mesa.id}</strong></td>
                  <td>{mesa.capacidad} personas</td>
                  <td><span className={`badge estado-${mesa.estado.toLowerCase()}`}>{mesa.estado}</span></td>
                  <td className="table-actions">
                    <button className="btn btn-icon btn-edit" onClick={() => setMesaDetalle(mesa.id)} title="Ver detalle">
                      <Eye size={16} />
                    </button>
                    {esAdmin && (
                      <>
                        <button className="btn btn-icon btn-edit" onClick={() => abrirEdicion(mesa)} title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button className="btn btn-icon btn-delete" onClick={() => handleEliminar(mesa)} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <MesaFormModal
          mesaInicial={mesaAEditar}
          onCancelar={() => setModalAbierto(false)}
          onGuardado={() => {
            setModalAbierto(false);
            cargarMesas(filtroEstado);
          }}
        />
      )}

      {mesaDetalle && <MesaDetalleModal idMesa={mesaDetalle} onCerrar={() => setMesaDetalle(null)} />}
    </div>
  );
}
