import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
// Importaremos api.js directamente o un servicio de detalle_comanda (que aún no existe).
import api from '../../services/api';

const DetalleComandaModal = ({ comanda, onClose }) => {
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    // DECISIÓN: Al abrir el modal, buscamos los detalles de esta comanda específica.
    cargarDetalles();
  }, [comanda.id]);

  const cargarDetalles = async () => {
    try {
      /* INCOMPLETO / SOLUCIÓN: El endpoint GET /api/comandas/:id/detalles NO existe aún en el backend. 
         Tampoco está listo detalle_comanda.routes.ts en app.ts.
         Solución a futuro: Cuando exista, se hace la petición y se hace 'setDetalles(response.data)'.
         Por ahora, cargamos un array mockeado para que el componente visual funcione. */
      
      // Simulación de respuesta del backend (Mock)
      const mockDetalles = [
        { id_producto: 101, nombre_producto: 'Milanesa con papas', cantidad: 2, estado: 'Pendiente', precio: 8000 },
        { id_producto: 102, nombre_producto: 'Gaseosa Cola', cantidad: 1, estado: 'Entregado', precio: 1500 }
      ];
      setDetalles(mockDetalles);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  };

  const modificarCantidad = (id_producto, delta) => {
    // DECISIÓN: Modificamos localmente el estado para dar respuesta rápida al UI.
    const nuevosDetalles = detalles.map(item => {
      if (item.id_producto === id_producto) {
        const nuevaCantidad = item.cantidad + delta;
        return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 };
      }
      return item;
    });
    setDetalles(nuevosDetalles);

    /* INCOMPLETO / SOLUCIÓN: Acá deberíamos enviar un PATCH a /api/detalle_comanda/:id_comanda/:id_producto 
       con la nueva cantidad, pero como el endpoint no funciona en backend todavía, no hacemos el request para evitar errores 500. */
  };

  const quitarProducto = (id_producto) => {
    setDetalles(detalles.filter(item => item.id_producto !== id_producto));
    /* INCOMPLETO / SOLUCIÓN: Enviar un DELETE a /api/detalle_comanda/:id_comanda/:id_producto */
  };

  return (
    // DECISIÓN: Estilos inline para un overlay oscuro y centrado de modal.
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', minWidth: '400px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Detalle Comanda - Mesa {comanda.id_mesa}</h3>
          {/* DECISIÓN: Botón para cerrar el modal usando icono X */}
          <button onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
            <X size={24} />
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {detalles.map((item) => (
            <li key={item.id_producto} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <div>
                <strong>{item.nombre_producto}</strong> <br/>
                <small>Estado: {item.estado}</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Botones para modificar cantidad de items (Requerimiento de Hoja de Ruta) */}
                <button onClick={() => modificarCantidad(item.id_producto, -1)}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => modificarCantidad(item.id_producto, 1)}>+</button>
                
                {/* Botón para quitar producto */}
                <button onClick={() => quitarProducto(item.id_producto)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'transparent' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
};

export default DetalleComandaModal;

