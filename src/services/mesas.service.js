import api from './api';

// estado es opcional: 'Libre', 'Ocupada' o 'Reservada'
export const getMesas = (estado) => api.get('/mesas', { params: { estado } });
export const getMesa = (id) => api.get(`/mesas/${id}`);
// Sin parámetros: mesas libres ahora. Con fecha y personas: mesas sin reservas en ese horario.
export const getMesasDisponibles = (fecha, personas) => api.get('/mesas/disponibles', { params: { fecha, personas } });
export const createMesa = (data) => api.post('/mesas', data);
export const updateMesa = (id, data) => api.put(`/mesas/${id}`, data);
export const deleteMesa = (id) => api.delete(`/mesas/${id}`);
