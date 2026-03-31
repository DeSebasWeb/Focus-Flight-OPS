import apiClient from './apiClient';

export const insuranceApi = {
  list: () => apiClient.get('/insurance'),
  getActive: () => apiClient.get('/insurance/active'),
  create: (data: any) => apiClient.post('/insurance', data),
  update: (id: string, data: any) => apiClient.put(`/insurance/${id}`, data),
};
