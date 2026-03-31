import { DroneCategory } from '../enums';
import { Weight } from '../value-objects';

export interface DroneProps {
  id: string;
  pilotId: string;
  registrationNumber?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  mtowGrams: number;
  category: DroneCategory;
  numRotors?: number;
  firmwareVersion?: string;
  purchaseDate?: string;
  photoUri?: string;
  isActive: boolean;
  totalFlightHours: number;
  createdAt: number;
  updatedAt: number;
}

export class Drone {
  readonly props: DroneProps;

  constructor(props: DroneProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get weight(): Weight {
    return Weight.fromGrams(this.props.mtowGrams);
  }

  get requiresRegistration(): boolean {
    return this.weight.requiresRegistration();
  }

  get isRegistered(): boolean {
    return !!this.props.registrationNumber;
  }

  get isLegallyCompliant(): boolean {
    if (this.requiresRegistration && !this.isRegistered) {
      return false;
    }
    return this.props.isActive;
  }

  addFlightHours(hours: number): Drone {
    return new Drone({
      ...this.props,
      totalFlightHours: this.props.totalFlightHours + hours,
      updatedAt: Date.now(),
    });
  }

  deactivate(): Drone {
    return new Drone({
      ...this.props,
      isActive: false,
      updatedAt: Date.now(),
    });
  }
}
