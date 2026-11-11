import api from './api';
import { MedioPago, conModelo } from '../models/modelos';

export const getMediosPago = () => api.get('/medios-pago').then(conModelo(MedioPago));
export const createMedioPago = (data) => api.post('/medios-pago', data);
export const updateMedioPago = (id, data) => api.put(`/medios-pago/${id}`, data);
export const deleteMedioPago = (id) => api.delete(`/medios-pago/${id}`);
