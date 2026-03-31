import apiClient from './apiClient';

export const certificateApi = {
  list: () => apiClient.get('/certificates'),
  checkExpiry: () => apiClient.get('/certificates/expiring'),
  create: (data: any) => apiClient.post('/certificates', data),
  remove: (id: string) => apiClient.delete(`/certificates/${id}`),
};
