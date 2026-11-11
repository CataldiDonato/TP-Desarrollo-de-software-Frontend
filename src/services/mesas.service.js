import api from './api';
import { Mesa, MesaDetalle, conModelo } from '../models/modelos';

// estado es opcional: 'Libre', 'Ocupada' o 'Reservada'
export const getMesas = (estado) => api.get('/mesas', { params: { estado } }).then(conModelo(Mesa));
export const getMesa = (id) => api.get(`/mesas/${id}`).then(conModelo(MesaDetalle));
// Sin parámetros: mesas libres ahora. Con fecha y personas: mesas sin reservas en ese horario.
export const getMesasDisponibles = (fecha, personas, excluirReserva) => api.get('/mesas/disponibles', { params: { fecha, personas, excluirReserva } }).then(conModelo(Mesa));
export const createMesa = (data) => api.post('/mesas', data);
export const updateMesa = (id, data) => api.put(`/mesas/${id}`, data);
export const deleteMesa = (id) => api.delete(`/mesas/${id}`);
