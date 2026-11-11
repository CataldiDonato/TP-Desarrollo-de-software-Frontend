import api from './api';
import { PrecioProducto, Producto, conModelo } from '../models/modelos';

export const getProductos = () => api.get('/productos').then(conModelo(Producto));
export const createProducto = (data) => api.post('/productos', data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);
// Historial de precios de un producto (del más nuevo al más viejo)
export const getHistorialPrecios = (id) => api.get(`/precio-producto/${id}/precios`).then(conModelo(PrecioProducto));
