import api from './api';

export const getMediosPago = () => api.get('/medios-pago');
export const createMedioPago = (data) => api.post('/medios-pago', data);
export const updateMedioPago = (id, data) => api.put(`/medios-pago/${id}`, data);
export const deleteMedioPago = (id) => api.delete(`/medios-pago/${id}`);
