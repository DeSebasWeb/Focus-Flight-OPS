import apiClient from './apiClient';

export const emergencyApi = {
  getContacts: () => apiClient.get('/emergency/contacts'),
  getNearestContacts: (lat: number, lng: number) =>
    apiClient.get(`/emergency/contacts/nearest?lat=${lat}&lng=${lng}`),
  getFlyawayProtocol: () => apiClient.get('/emergency/flyaway-protocol'),
  triggerEvent: (data: any) => apiClient.post('/emergency/events', data),
  addAction: (eventId: string, actionText: string) =>
    apiClient.patch(`/emergency/events/${eventId}/actions`, { actionText }),
  resolveEvent: (eventId: string) =>
    apiClient.patch(`/emergency/events/${eventId}/resolve`),
};
