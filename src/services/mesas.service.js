import api from './api';

export const getMesas = () => api.get('/mesas');
export const getMesasDisponibles = () => api.get('/mesas/disponibles');
export const createMesa = (data) => api.post('/mesas', data);
export const updateMesa = (id, data) => api.put(`/mesas/${id}`, data);
export const deleteMesa = (id) => api.delete(`/mesas/${id}`);
