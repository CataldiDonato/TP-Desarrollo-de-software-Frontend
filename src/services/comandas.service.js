import api from './api';

// estado es opcional: 'Abierta', 'Pagada' o 'Cancelada'
export const getComandas = (estado) => api.get('/comandas', { params: { estado } });
export const getComanda = (id) => api.get(`/comandas/${id}`);
export const createComanda = (data) => api.post('/comandas', data);
// Para cobrar: { estado: 'Pagada', id_medio_pago }. Para anular: { estado: 'Cancelada' }
export const cambiarEstadoComanda = (id, data) => api.patch(`/comandas/${id}/estado`, data);
