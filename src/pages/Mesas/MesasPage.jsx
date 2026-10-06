import { useState, useEffect } from 'react';
import { getMesas, createMesa, deleteMesa } from '../../services/mesas.service';
import toast from 'react-hot-toast';

export default function MesasPage() {
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await getMesas();
      setMesas(res.data);
    } catch (err) {
      toast.error('Error al cargar las mesas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearMesa = async () => {
    const capacidad = prompt('¿Qué capacidad tiene la nueva mesa? (ej: 4)');
    if (!capacidad) return;
    try {
      await createMesa({ capacidad: parseInt(capacidad) });
      toast.success('Mesa creada exitosamente');
      cargarDatos();
    } catch (err) {
      toast.error('Error al crear la mesa');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta mesa?')) return;
    try {
      await deleteMesa(id);
      toast.success('Mesa eliminada');
      cargarDatos();
    } catch (err) {
      toast.error('Error al eliminar la mesa');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Mesas</h1>
        <button className="btn btn-primary" onClick={handleCrearMesa}>
          + Nueva Mesa
        </button>
      </div>

      {cargando ? (
        <p>Cargando mesas...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Mesa (ID)</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesas.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.capacidad} personas</td>
                <td>
                  <span className={`badge estado-${m.estado.toLowerCase()}`}>
                    {m.estado}
                  </span>
                </td>
                <td>
                  <button className="btn-icon text-danger" onClick={() => handleEliminar(m.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {mesas.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No hay mesas registradas en el local.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
