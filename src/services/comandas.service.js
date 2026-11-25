import api from './api';
import { Comanda, conModelo } from '../models/modelos';

// estado es opcional: 'Abierta', 'Pagada' o 'Cancelada'
export const getComandas = (estado) => api.get('/comandas', { params: { estado } }).then(conModelo(Comanda));
export const getComanda = (id) => api.get(`/comandas/${id}`).then(conModelo(Comanda));
export const createComanda = (data) => api.post('/comandas', data);
// Para cobrar: { estado: 'Pagada', id_medio_pago }. Para anular: { estado: 'Cancelada' }
export const cambiarEstadoComanda = (id, data) => api.patch(`/comandas/${id}/estado`, data);
export const crearPagoMercadoPago = (idComanda) => api.post(`/comandas/${idComanda}/mercadopago`);