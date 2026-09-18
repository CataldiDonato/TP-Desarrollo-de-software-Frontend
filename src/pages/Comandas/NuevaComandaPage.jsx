import React, { useState, useEffect } from 'react';
import { createComanda } from '../../services/comandas.service';

const NuevaComandaPage = () => {
  const [mesa, setMesa] = useState('');
  // Productos disponibles para el Select
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  
  // Estado para el formulario de Cargar Producto
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  
  // Listado temporal derecho acumulativo antes de confirmar el envío
  const [itemsTemporal, setItemsTemporal] = useState([]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    /* INCOMPLETO / SOLUCIÓN: La ruta de productos.routes.ts está comentada en backend.
       No podemos hacer GET /api/productos.
       Solución por ahora: Inyectamos un arreglo de productos mockeados (Hardcodeados).
       Cuando el backend lo resuelva, se borra el mock y se usa el servicio 'getProductos()' */
    setProductosDisponibles([
      { id: 1, nombre: 'Pizza Margarita', precio: 12000 },
      { id: 2, nombre: 'Hamburguesa Completa', precio: 8500 },
      { id: 3, nombre: 'Cerveza Artesanal', precio: 3000 }
    ]);
  };

  const agregarAlListado = (e) => {
    e.preventDefault();
    if (!productoSeleccionado || cantidad < 1) return;

    // DECISIÓN: Busco los datos del producto seleccionado para mostrarlos en el listado temporal.
    const productoInfo = productosDisponibles.find(p => p.id === parseInt(productoSeleccionado));
    
    // Verificamos si ya existe en la lista temporal para sumar la cantidad
    const existe = itemsTemporal.find(item => item.id === productoInfo.id);
    if (existe) {
      setItemsTemporal(itemsTemporal.map(item => 
        item.id === productoInfo.id ? { ...item, cantidad: item.cantidad + parseInt(cantidad) } : item
      ));
    } else {
      setItemsTemporal([...itemsTemporal, { ...productoInfo, cantidad: parseInt(cantidad) }]);
    }
    
    // Reseteamos el formulario de producto
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const confirmarEnvio = async () => {
    if (!mesa) return alert('Por favor, ingrese el número de mesa');
    if (itemsTemporal.length === 0) return alert('Debe cargar al menos un producto');

    try {
      /* INCOMPLETO / SOLUCIÓN: El schema pide 'id_mozo' y 'id_mesa'. Como no hay Login/Sesión todavía, 
         hardcodeamos 'id_mozo: 1'. 
         Además, el backend actual POST /api/comandas solo crea la comanda, NO procesa el arreglo de detalles 
         ni los inserta juntos en la DB. 
         Solución Futura: Modificar el controller en Backend para que reciba 'detalles' en el body y use 
         una transacción Prisma (prisma.comanda.create({ data: { ..., detalles_comandas: { create: [...] } } })). 
         Por ahora, enviamos el POST y vaciamos la lista asumiendo éxito. */

      const data = {
        fecha: new Date().toISOString(),
        id_mesa: parseInt(mesa),
        id_mozo: 1, 
        // Enviaríamos itemsTemporal al backend aquí
        detalles: itemsTemporal.map(item => ({ id_producto: item.id, cantidad: item.cantidad }))
      };

      await createComanda(data);
      alert('Comanda creada con éxito!');
      
      // Limpiamos la pantalla
      setMesa('');
      setItemsTemporal([]);
    } catch (error) {
      console.error('Error al enviar la comanda:', error);
      alert('Error al crear la comanda');
    }
  };

  return (
    // DECISIÓN: Layout dividido en 2 columnas (Izquierda Formulario, Derecha Listado) como sugiere "Listado temporal derecho"
    <div style={{ display: 'flex', gap: '40px', padding: '20px' }}>
      
      {/* Columna Izquierda */}
      <div style={{ flex: 1 }}>
        <h2>Apertura de Comanda</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Número de mesa: </label>
          <input 
            type="number" 
            value={mesa} 
            onChange={(e) => setMesa(e.target.value)} 
            style={{ padding: '5px' }}
          />
        </div>

        <form onSubmit={agregarAlListado} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Cargar Producto</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={productoSeleccionado} 
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              style={{ padding: '5px', flex: 1 }}
            >
              <option value="">Seleccione un producto...</option>
              {productosDisponibles.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.nombre}</option>
              ))}
            </select>
            
            <input 
              type="number" 
              min="1" 
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)}
              style={{ width: '60px', padding: '5px' }}
            />
            
            {/* DECISIÓN: Botón "+" como especifica la hoja de ruta */}
            <button type="submit" style={{ padding: '5px 15px', cursor: 'pointer' }}>
              +
            </button>
          </div>
        </form>
      </div>

      {/* Columna Derecha (Listado temporal acumulativo) */}
      <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '40px' }}>
        <h3>Listado Temporal</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {itemsTemporal.map((item, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>{item.cantidad}x {item.nombre}</span>
              <span>${item.precio * item.cantidad}</span>
            </li>
          ))}
        </ul>
        
        {itemsTemporal.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '2px solid #000', paddingTop: '10px' }}>
            <button 
              onClick={confirmarEnvio}
              style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
            >
              Confirmar y Enviar a Cocina
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default NuevaComandaPage;

