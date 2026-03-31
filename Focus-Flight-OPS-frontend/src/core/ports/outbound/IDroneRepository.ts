import { Drone } from '../../entities';

export interface IDroneRepository {
  findById(id: string): Promise<Drone | null>;
  findByPilotId(pilotId: string): Promise<Drone[]>;
  findBySerialNumber(serial: string): Promise<Drone | null>;
  save(drone: Drone): Promise<void>;
  update(drone: Drone): Promise<void>;
  delete(id: string): Promise<void>;
}
