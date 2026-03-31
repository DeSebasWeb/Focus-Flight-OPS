import { FlightLog, TelemetryPoint } from '../../entities';

export interface IFlightLogger {
  startFlight(missionId: string, pilotId: string, droneId: string, latitude: number, longitude: number): Promise<FlightLog>;
  recordTelemetry(flightLogId: string, telemetry: Omit<TelemetryPoint['props'], 'id' | 'flightLogId'>): Promise<void>;
  endFlight(flightLogId: string, landingLat: number, landingLng: number, maxAltitude?: number, maxDistance?: number): Promise<FlightLog>;
  getFlightLog(id: string): Promise<FlightLog>;
  getFlightHistory(pilotId: string): Promise<FlightLog[]>;
  getFlightsByDateRange(pilotId: string, startDate: string, endDate: string): Promise<FlightLog[]>;
  exportFlightLog(flightLogId: string, format: 'PDF' | 'CSV'): Promise<string>;
}
