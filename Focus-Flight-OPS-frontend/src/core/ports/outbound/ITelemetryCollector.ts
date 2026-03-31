import { TelemetryPoint } from '../../entities';

export interface ITelemetryCollector {
  saveTelemetryPoint(point: TelemetryPoint): Promise<void>;
  findByFlightLogId(flightLogId: string): Promise<TelemetryPoint[]>;
  getLatestByFlightLogId(flightLogId: string): Promise<TelemetryPoint | null>;
}
