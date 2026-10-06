import api from './api';

// Agrega un producto a una comanda abierta: { id_comanda, id_producto, cantidad }
export const agregarDetalle = (data) => api.post('/detalle-comanda', data);
export const cambiarCantidadDetalle = (idComanda, idProducto, cantidad) =>
  api.put(`/detalle-comanda/${idComanda}/${idProducto}`, { cantidad });
export const quitarDetalle = (idComanda, idProducto) => api.delete(`/detalle-comanda/${idComanda}/${idProducto}`);
