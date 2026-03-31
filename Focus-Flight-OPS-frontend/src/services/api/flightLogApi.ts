import apiClient from './apiClient';

export const flightLogApi = {
  list: () => apiClient.get('/flight-logs'),
  getById: (id: string) => apiClient.get(`/flight-logs/${id}`),
  startFlight: (data: any) => apiClient.post('/flight-logs/start', data),
  endFlight: (id: string, data: any) => apiClient.patch(`/flight-logs/${id}/end`, data),
  recordTelemetry: (flightLogId: string, data: any) =>
    apiClient.post(`/flight-logs/${flightLogId}/telemetry`, data),
  getTelemetry: (flightLogId: string) =>
    apiClient.get(`/flight-logs/${flightLogId}/telemetry`),
};
