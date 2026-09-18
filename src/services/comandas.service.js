import api from './api';

export const getComandas = () => api.get('/comandas');
export const createComanda = (data) => api.post('/comandas', data);
export const cambiarEstadoComanda = (id, data) => api.patch(`/comandas/${id}/estado`, data);
