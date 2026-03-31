import { AirspaceZone } from '../../entities';
import { Coordinates } from '../../value-objects';

export interface AirspaceCheckResult {
  isRestricted: boolean;
  restrictedZones: AirspaceZone[];
  advisoryZones: AirspaceZone[];
  nearestAirportDistanceM?: number;
}

export interface IGeofenceProvider {
  checkAirspace(position: Coordinates, radiusM?: number): Promise<AirspaceCheckResult>;
  getZonesInArea(centerLat: number, centerLng: number, radiusKm: number): Promise<AirspaceZone[]>;
  isWithinNoFlyZone(position: Coordinates): Promise<boolean>;
}
