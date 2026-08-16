// Instancia central de Axios configurada con la URL base de la API.
import api from './api';

// GET /cocina/pedidos: trae solo detalles pendientes o en preparación para el KDS.
export const getPedidosActivos = () => api.get('/cocina/pedidos');
// PATCH /cocina/detalles/estado: avanza un detalle al siguiente estado e identifica al cocinero.
export const actualizarEstado = (data) => api.patch('/cocina/detalles/estado', data);
