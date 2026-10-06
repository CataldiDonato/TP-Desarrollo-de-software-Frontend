import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token venció o es inválido (401), se cierra la sesión y se vuelve al login.
// Se excluye el propio login: ahí un 401 significa "contraseña incorrecta" y se muestra el mensaje.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url === '/auth/login';
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;