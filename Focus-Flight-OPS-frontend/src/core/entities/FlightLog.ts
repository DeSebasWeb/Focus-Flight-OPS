import { OperationType, RegulatoryVersion } from '../enums';

export type FlightLogStatus = 'IN_FLIGHT' | 'COMPLETED' | 'EMERGENCY_LANDED';
export type Visibility = 'GOOD' | 'MODERATE' | 'POOR';

export interface FlightLogProps {
  id: string;
  missionId: string;
  pilotId: string;
  droneId: string;
  takeoffTime: string;
  landingTime?: string;
  totalFlightMinutes?: number;
  takeoffLat: number;
  takeoffLng: number;
  takeoffAltitudeM?: number;
  landingLat?: number;
  landingLng?: number;
  maxAltitudeAglM?: number;
  maxDistanceM?: number;
  weatherConditions?: string;
  windSpeedKmh?: number;
  temperatureC?: number;
  visibility?: Visibility;
  operationType: OperationType;
  status: FlightLogStatus;
  notes?: string;
  regulatoryVersion: RegulatoryVersion;
  createdAt: number;
  updatedAt: number;
}

export class FlightLog {
  readonly props: FlightLogProps;

  constructor(props: FlightLogProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isInFlight(): boolean {
    return this.props.status === 'IN_FLIGHT';
  }

  endFlight(
    landingLat: number,
    landingLng: number,
    maxAltitude?: number,
    maxDistance?: number,
  ): FlightLog {
    const landingTime = new Date().toISOString();
    const takeoffMs = new Date(this.props.takeoffTime).getTime();
    const landingMs = new Date(landingTime).getTime();
    const totalMinutes = (landingMs - takeoffMs) / 60000;

    return new FlightLog({
      ...this.props,
      landingTime,
      landingLat,
      landingLng,
      totalFlightMinutes: totalMinutes,
      maxAltitudeAglM: maxAltitude ?? this.props.maxAltitudeAglM,
      maxDistanceM: maxDistance ?? this.props.maxDistanceM,
      status: 'COMPLETED',
      updatedAt: Date.now(),
    });
  }

  markEmergencyLanded(): FlightLog {
    return new FlightLog({
      ...this.props,
      landingTime: new Date().toISOString(),
      status: 'EMERGENCY_LANDED',
      updatedAt: Date.now(),
    });
  }
}
