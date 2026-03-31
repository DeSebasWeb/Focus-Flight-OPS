import apiClient from './apiClient';

export const missionApi = {
  list: () => apiClient.get('/missions'),
  getById: (id: string) => apiClient.get(`/missions/${id}`),
  create: (data: any) => apiClient.post('/missions', data),
  update: (id: string, data: any) => apiClient.put(`/missions/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/missions/${id}/status`, { status }),
};
