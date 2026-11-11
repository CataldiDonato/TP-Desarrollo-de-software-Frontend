// Instancia central de Axios configurada con la URL base de la API.
import api from './api';
import { ComandaCocina, PedidoCocina, conModelo } from '../models/modelos';

// GET /cocina/pedidos: trae los detalles pendientes o en preparación para el KDS.
// estado es opcional: 'Pendiente' o 'En_Preparacion' para ver solo esos.
export const getPedidosActivos = (estado) => api.get('/cocina/pedidos', { params: { estado } }).then(conModelo(PedidoCocina));
// GET /cocina/comandas/:id: detalle de una comanda (mesa, mozo y todos sus productos con observaciones).
export const getComandaCocina = (id) => api.get(`/cocina/comandas/${id}`).then(conModelo(ComandaCocina));
// PATCH /cocina/detalles/estado: avanza un detalle al siguiente estado e identifica al cocinero.
export const actualizarEstado = (data) => api.patch('/cocina/detalles/estado', data);
