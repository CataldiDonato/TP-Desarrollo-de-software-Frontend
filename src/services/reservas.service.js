import api from './api';

export const getReservas = () => api.get('/reservas');
export const createReserva = (data) => api.post('/reservas', data);
export const updateReserva = (id, data) => api.put(`/reservas/${id}`, data);
export const deleteReserva = (id) => api.delete(`/reservas/${id}`);
export const updateEstadoReserva = (id, data) => api.patch(`/reservas/${id}/estado`, data);
export const asignarMesaReserva = (id, data) => api.patch(`/reservas/${id}/asignar-mesa`, data);
