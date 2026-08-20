// Instancia central de Axios configurada con la URL base de la API.
import api from './api';

// GET /dashboard/stats: devuelve las métricas agregadas que alimentan las tarjetas de Home.
export const getDashboardStats = () => api.get('/dashboard/stats');
// GET /comandas: Home filtra las comandas Abiertas para mostrar las mesas activas.
export const getMesasActivas = () => api.get('/comandas');
