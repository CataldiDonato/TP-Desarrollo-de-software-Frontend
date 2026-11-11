import api from './api';
import { Categoria, conModelo } from '../models/modelos';

export const getCategorias = () => api.get('/categorias').then(conModelo(Categoria));
export const createCategoria = (data) => api.post('/categorias', data);
export const updateCategoria = (id, data) => api.put(`/categorias/${id}`, data);
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);
