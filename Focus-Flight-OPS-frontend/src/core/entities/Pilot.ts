import { RegulatoryVersion } from '../enums';

export interface PilotProps {
  id: string;
  documentType: 'CC' | 'CE' | 'PASSPORT';
  documentNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  uaeacPilotNumber?: string;
  licenseType?: 'OPEN' | 'SPECIFIC' | 'CERTIFIED';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePhotoUri?: string;
  regulatoryVersion: RegulatoryVersion;
  createdAt: number;
  updatedAt: number;
}

export class Pilot {
  readonly props: PilotProps;

  constructor(props: PilotProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get hasValidCertification(): boolean {
    return !!this.props.uaeacPilotNumber;
  }

  updateProfile(updates: Partial<Omit<PilotProps, 'id' | 'createdAt'>>): Pilot {
    return new Pilot({
      ...this.props,
      ...updates,
      updatedAt: Date.now(),
    });
  }
}
