import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteMedioPago, getMediosPago } from '../../services/mediosPago.service';
import { mensajeDeError } from '../../utils/formato';
import MedioPagoFormModal from './MedioPagoFormModal';

export default function MediosPagoPage() {
  const [medios, setMedios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [medioAEditar, setMedioAEditar] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarMedios();
  }, []);

  async function cargarMedios() {
    setCargando(true);
    setError('');
    try {
      const respuesta = await getMediosPago();
      setMedios(respuesta.data);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar los medios de pago.'));
    } finally {
      setCargando(false);
    }
  }

  function abrirNuevo() {
    setMedioAEditar(null);
    setModalAbierto(true);
  }

  function abrirEdicion(medio) {
    setMedioAEditar(medio);
    setModalAbierto(true);
  }

  async function eliminarMedio(medio) {
    if (!window.confirm(`¿Eliminar el medio de pago "${medio.tipo}"?`)) return;
    try {
      await deleteMedioPago(medio.id);
      toast.success('Medio de pago eliminado.');
      cargarMedios();
    } catch (err) {
      toast.error(mensajeDeError(err, 'No se pudo eliminar el medio de pago.'));
    }
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medios de pago</h1>
          <p className="page-subtitle">Formas de cobro que acepta el local.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={abrirNuevo}>
          <Plus size={18} /> Nuevo medio de pago
        </button>
      </div>

      {cargando && <p className="state-msg">Cargando medios de pago...</p>}
      {error && <p className="state-msg state-error">{error}</p>}

      {!cargando && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Tipo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {medios.length === 0 ? (
                <tr><td colSpan="2" className="table-empty">No hay medios de pago cargados.</td></tr>
              ) : medios.map((medio) => (
                <tr key={medio.id}>
                  <td><strong>{medio.tipo}</strong></td>
                  <td className="table-actions">
                    <button className="btn btn-icon btn-edit" type="button" onClick={() => abrirEdicion(medio)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-icon btn-delete" type="button" onClick={() => eliminarMedio(medio)} title="Eliminar">
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
        <MedioPagoFormModal
          medioInicial={medioAEditar}
          onCancelar={() => setModalAbierto(false)}
          onGuardado={() => {
            setModalAbierto(false);
            cargarMedios();
          }}
        />
      )}
    </section>
  );
}
