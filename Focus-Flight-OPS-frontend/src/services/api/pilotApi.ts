import apiClient from './apiClient';

export const pilotApi = {
  getMyProfile: () => apiClient.get('/pilots/me'),
  createProfile: (data: any) => apiClient.post('/pilots', data),
  updateProfile: (data: any) => apiClient.put('/pilots/me', data),
};
