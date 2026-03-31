export type EmergencyContactRole =
  | 'ATC'
  | 'BOMBEROS'
  | 'POLICIA'
  | 'AMBULANCIA'
  | 'AEROCIVIL'
  | 'CAE';

export interface EmergencyContactProps {
  id: string;
  name: string;
  role: EmergencyContactRole;
  phone: string;
  frequencyMhz?: number;
  airportCode?: string;
  region?: string;
  isDefault: boolean;
}

export class EmergencyContact {
  readonly props: EmergencyContactProps;

  constructor(props: EmergencyContactProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get displayName(): string {
    const prefix = this.props.airportCode ? `[${this.props.airportCode}] ` : '';
    return `${prefix}${this.props.name}`;
  }
}
