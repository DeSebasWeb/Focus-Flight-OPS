import { WeatherSnapshot, AirspaceZone } from '../../entities';
import { AirspaceCheckResult } from '../outbound/IGeofenceProvider';

export interface PreFlightLegalResult {
  isApproved: boolean;
  documentCheck: {
    droneRegistered: boolean;
    certificateValid: boolean;
    insuranceActive: boolean;
    errors: string[];
  };
  airspaceCheck: AirspaceCheckResult;
  weatherCheck: {
    snapshot: WeatherSnapshot;
    isSafe: boolean;
    warnings: string[];
  };
  blockingReasons: string[];
}

export interface IPreFlightLegal {
  validateAll(pilotId: string, droneId: string, latitude: number, longitude: number): Promise<PreFlightLegalResult>;
  checkAirspace(latitude: number, longitude: number): Promise<AirspaceCheckResult>;
  checkWeather(latitude: number, longitude: number): Promise<WeatherSnapshot>;
  getRestrictedZones(centerLat: number, centerLng: number, radiusKm: number): Promise<AirspaceZone[]>;
}
