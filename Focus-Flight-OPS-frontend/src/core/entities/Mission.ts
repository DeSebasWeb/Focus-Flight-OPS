import { OperationType, RegulatoryVersion } from '../enums';

export type MissionPurpose =
  | 'MAPPING'
  | 'INSPECTION'
  | 'PHOTOGRAPHY'
  | 'VIDEOGRAPHY'
  | 'AGRICULTURE'
  | 'SURVEILLANCE'
  | 'TRAINING'
  | 'OTHER';

export type MissionStatus =
  | 'PLANNED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MissionProps {
  id: string;
  pilotId: string;
  droneId: string;
  name: string;
  purpose: MissionPurpose;
  purposeDetail?: string;
  plannedDate: string;
  plannedLocationLat: number;
  plannedLocationLng: number;
  plannedLocationName?: string;
  plannedAltitudeM?: number;
  operationType: OperationType;
  status: MissionStatus;
  regulatoryVersion: RegulatoryVersion;
  createdAt: number;
  updatedAt: number;
}

export class Mission {
  readonly props: MissionProps;

  constructor(props: MissionProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get canStartPreflight(): boolean {
    return this.props.status === 'PLANNED' || this.props.status === 'APPROVED';
  }

  get isActive(): boolean {
    return this.props.status === 'IN_PROGRESS';
  }

  updateStatus(status: MissionStatus): Mission {
    return new Mission({
      ...this.props,
      status,
      updatedAt: Date.now(),
    });
  }
}
