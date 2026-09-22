import api from './api';

export const getStats = () => api.get('/home/stats');
