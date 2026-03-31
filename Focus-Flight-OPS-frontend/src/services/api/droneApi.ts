import apiClient from './apiClient';

export const droneApi = {
  list: () => apiClient.get('/drones'),
  getById: (id: string) => apiClient.get(`/drones/${id}`),
  create: (data: any) => apiClient.post('/drones', data),
  update: (id: string, data: any) => apiClient.put(`/drones/${id}`, data),
  remove: (id: string) => apiClient.delete(`/drones/${id}`),
};
