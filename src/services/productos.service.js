import api from './api';

export const getProductos = () => api.get('/productos');
export const createProducto = (data) => api.post('/productos', data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);
// Historial de precios de un producto (del más nuevo al más viejo)
export const getHistorialPrecios = (id) => api.get(`/precio-producto/${id}/precios`);
