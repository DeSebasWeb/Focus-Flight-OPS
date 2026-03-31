import apiClient from './apiClient';

export const weatherApi = {
  getCurrent: (lat: number, lng: number) =>
    apiClient.get(`/weather/current?lat=${lat}&lng=${lng}`),
  getForecast: (lat: number, lng: number, hours = 6) =>
    apiClient.get(`/weather/forecast?lat=${lat}&lng=${lng}&hours=${hours}`),
  getKpIndex: () =>
    apiClient.get('/weather/kp-index'),
};
