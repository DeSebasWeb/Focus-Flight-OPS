import { Drone, DroneProps } from '../../entities';

export interface IFleetManagement {
  registerDrone(props: Omit<DroneProps, 'id' | 'isActive' | 'totalFlightHours' | 'createdAt' | 'updatedAt'>): Promise<Drone>;
  updateDrone(id: string, updates: Partial<DroneProps>): Promise<Drone>;
  deactivateDrone(id: string): Promise<void>;
  getDrone(id: string): Promise<Drone>;
  listDrones(pilotId: string): Promise<Drone[]>;
}
