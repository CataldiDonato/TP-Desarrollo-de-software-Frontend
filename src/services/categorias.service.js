import api from './api';

export const getCategorias = () => api.get('/Categorias');
export const createCategoria = (data) => api.post('/Categorias', data);
export const updateCategoria = (id, data) => api.put(`/Categorias/${id}`, data);
export const deleteCategoria = (id) => api.delete(`/Categorias/${id}`);