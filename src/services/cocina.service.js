import api from './api';

export const getPedidosActivos = () => api.get('/cocina/pedidos');
export const actualizarEstado = (data) => api.patch('/cocina/detalles/estado', data);
