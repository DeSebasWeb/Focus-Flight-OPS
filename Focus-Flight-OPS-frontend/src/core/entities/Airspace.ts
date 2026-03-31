export type AirspaceZoneType =
  | 'AIRPORT'
  | 'MILITARY'
  | 'GOVERNMENT'
  | 'PRISON'
  | 'CRITICAL_INFRA'
  | 'TFR';

export interface AirspaceZoneProps {
  id: string;
  name: string;
  type: AirspaceZoneType;
  icaoCode?: string;
  centerLat: number;
  centerLng: number;
  radiusM: number;
  geometryGeoJson?: string;
  maxAltitudeM?: number;
  isPermanent: boolean;
  validFrom?: string;
  validUntil?: string;
  source: 'BUNDLED' | 'AIRMAP' | 'NOTAM';
  updatedAt: number;
}

const AIRPORT_EXCLUSION_RADIUS_M = 5000;

export class AirspaceZone {
  readonly props: AirspaceZoneProps;

  constructor(props: AirspaceZoneProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isActive(): boolean {
    if (this.props.isPermanent) return true;
    const now = Date.now();
    const from = this.props.validFrom ? new Date(this.props.validFrom).getTime() : 0;
    const until = this.props.validUntil ? new Date(this.props.validUntil).getTime() : Infinity;
    return now >= from && now <= until;
  }

  get isAirport(): boolean {
    return this.props.type === 'AIRPORT';
  }

  get exclusionRadiusM(): number {
    if (this.isAirport) return AIRPORT_EXCLUSION_RADIUS_M;
    return this.props.radiusM;
  }

  get isNoFlyZone(): boolean {
    return ['AIRPORT', 'MILITARY', 'GOVERNMENT', 'PRISON'].includes(this.props.type);
  }
}
