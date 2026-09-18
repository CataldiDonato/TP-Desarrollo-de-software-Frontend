import React, { useState, useEffect } from 'react';
import { getComandas } from '../../services/comandas.service';
// DECISIÓN: Usamos lucide-react para los íconos de forma consistente con el proyecto.
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DetalleComandaModal from './DetalleComandaModal';

const ComandasPage = () => {
  const navigate = useNavigate();
  // Estado para guardar las comandas obtenidas del backend
  const [comandas, setComandas] = useState([]);
  // Estado para manejar qué comanda se abre en el modal de detalles
  const [comandaSeleccionada, setComandaSeleccionada] = useState(null);

  useEffect(() => {
    cargarComandas();
  }, []);

  const cargarComandas = async () => {
    try {
      // DECISIÓN: Consumimos el endpoint real GET /api/comandas.
      const response = await getComandas();
      setComandas(response.data);
    } catch (error) {
      console.error('Error al obtener comandas:', error);
      /* INCOMPLETO / SOLUCIÓN: Si el backend falla porque no está levantado o la base de datos está vacía, 
         la pantalla quedaría en blanco. La solución ideal aquí es interceptar el error e inyectar un array mockeado 
         temporalmente con 'setComandas(mockData)' y además mostrar un toast de error (react-hot-toast) avisando que se usan datos locales. */
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* DECISIÓN: Agregué estilos en línea básicos para asegurar que se vea estructurado, 
          ya que no vi Tailwind en el package.json, asumo que manejan estilos por index.css. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Listado de Comandas</h2>
        {/* DECISIÓN: Botón para navegar a la página de Nueva Comanda */}
        <button 
          onClick={() => navigate('/comandas/nueva')}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Nueva Comanda
        </button>
      </div>
      
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th>Mesa</th>
            <th>Mozo</th>
            <th>Método Pago</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {comandas.length > 0 ? (
            comandas.map((comanda) => (
              <tr key={comanda.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{comanda.id_mesa}</td>
                {/* INCOMPLETO / SOLUCIÓN: El backend (según schema.prisma) solo devuelve 'id_mozo' y 'id_medio_pago', no el nombre string. 
                    Solución: Cuando los endpoints de Usuarios y Medios de pago estén listos, deberíamos hacer un GET a esos endpoints 
                    y cruzar la información en el frontend, o bien pedirle al encargado del Backend que haga un JOIN en el GET /comandas 
                    y nos mande 'nombre_mozo' y 'tipo_medio_pago'. Por ahora muestro el ID. */}
                <td>{comanda.id_mozo || 'N/A'}</td>
                <td>{comanda.id_medio_pago || '-'}</td>
                <td>$ {comanda.total || 0 /* El total debe calcularse iterando el detalle_comanda, que ahora no viene en el backend */}</td>
                <td>{new Date(comanda.fecha).toLocaleDateString()}</td>
                <td>{comanda.estado}</td>
                <td>
                  {/* DECISIÓN: El botón abre el modal, sin navegar a otra página. Esto hace que sea más fluido para el mozo. */}
                  <button 
                    onClick={() => setComandaSeleccionada(comanda)}
                    style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                  >
                    <Eye size={16} /> VER DETALLES
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                No hay comandas activas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Renderizado condicional del Modal de Detalles */}
      {comandaSeleccionada && (
        <DetalleComandaModal 
          comanda={comandaSeleccionada} 
          onClose={() => setComandaSeleccionada(null)} 
        />
      )}
    </div>
  );
};

export default ComandasPage;
