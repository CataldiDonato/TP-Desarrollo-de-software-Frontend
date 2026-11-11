import api from './api';

export const login = (email, contrasenia) => api.post('/auth/login', { email, contrasenia });
