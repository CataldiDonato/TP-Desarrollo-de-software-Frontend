import api from './api';

// filtros es opcional: { cliente: 'juan', fecha: '2026-10-10' }
export const getReservas = (filtros) => api.get('/reservas', { params: filtros });
export const createReserva = (data) => api.post('/reservas', data);
export const updateReserva = (id, data) => api.put(`/reservas/${id}`, data);
export const deleteReserva = (id) => api.delete(`/reservas/${id}`);
export const updateEstadoReserva = (id, data) => api.patch(`/reservas/${id}/estado`, data);
