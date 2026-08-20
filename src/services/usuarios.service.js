// Instancia central de Axios configurada con la URL base de la API.
import api from './api';

// GET /usuarios: obtiene el listado que renderiza UsuariosPage.
export const getUsuarios = () => api.get('/usuarios');
// GET /usuarios/:id: disponible para consultar el detalle de un único usuario si otra vista lo necesita.
export const getUsuariosById = (id) => api.get(`/usuarios/${id}`);
// POST /usuarios: registra un usuario nuevo desde UsuarioFormModal.
export const createUsuario = (data) => api.post('/usuarios', data);
// PUT /usuarios/:id: actualiza los datos enviados desde UsuarioFormModal.
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
// DELETE /usuarios/:id: elimina el usuario seleccionado en la tabla.
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
