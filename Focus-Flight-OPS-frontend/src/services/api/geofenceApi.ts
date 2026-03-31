import apiClient from './apiClient';

export const geofenceApi = {
  check: (lat: number, lng: number) =>
    apiClient.get(`/geofence/check?lat=${lat}&lng=${lng}`),
  getZones: (lat: number, lng: number, radiusKm = 20) =>
    apiClient.get(`/geofence/zones?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
};
