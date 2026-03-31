import { FlightLog } from '../../entities';

export interface IFlightLogRepository {
  findById(id: string): Promise<FlightLog | null>;
  findByMissionId(missionId: string): Promise<FlightLog[]>;
  findByPilotId(pilotId: string): Promise<FlightLog[]>;
  findByDroneId(droneId: string): Promise<FlightLog[]>;
  findByDateRange(pilotId: string, startDate: string, endDate: string): Promise<FlightLog[]>;
  save(flightLog: FlightLog): Promise<void>;
  update(flightLog: FlightLog): Promise<void>;
}
