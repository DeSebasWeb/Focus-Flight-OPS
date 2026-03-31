import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { IGeofenceProvider, AirspaceCheckResult, AirspaceZoneData } from '../../../../domain/ports/outbound';

@Injectable()
export class LocalGeofenceAdapter implements IGeofenceProvider {
  constructor(private readonly prisma: PrismaService) {}

  async checkAirspace(lat: number, lng: number): Promise<AirspaceCheckResult> {
    const allZones = await this.prisma.airspaceZone.findMany({
      where: {
        OR: [
          { isPermanent: true },
          { validFrom: { lte: new Date() }, validUntil: { gte: new Date() } },
        ],
      },
      include: { type: true },
    });

    const restrictedZones: AirspaceZoneData[] = [];
    const advisoryZones: AirspaceZoneData[] = [];
    let nearestAirportDistanceM: number | undefined;

    for (const zone of allZones) {
      const distanceM = this.haversineDistance(lat, lng, Number(zone.centerLat), Number(zone.centerLng));

      if (zone.type.code === 'AIRPORT') {
        if (nearestAirportDistanceM === undefined || distanceM < nearestAirportDistanceM) {
          nearestAirportDistanceM = Math.round(distanceM);
        }
      }

      if (distanceM <= zone.radiusM) {
        const zoneData: AirspaceZoneData = {
          id: zone.id,
          name: zone.name,
          type: zone.type.code,
          icaoCode: zone.icaoCode,
          centerLat: Number(zone.centerLat),
          centerLng: Number(zone.centerLng),
          radiusM: zone.radiusM,
          isPermanent: zone.isPermanent,
        };

        if (['AIRPORT', 'MILITARY', 'GOVERNMENT', 'PRISON'].includes(zone.type.code)) {
          restrictedZones.push(zoneData);
        } else {
          advisoryZones.push(zoneData);
        }
      }
    }

    return {
      isRestricted: restrictedZones.length > 0,
      restrictedZones,
      advisoryZones,
      nearestAirportDistanceM,
    };
  }

  async getZonesInArea(lat: number, lng: number, radiusKm: number): Promise<AirspaceZoneData[]> {
    const allZones = await this.prisma.airspaceZone.findMany({
      include: { type: true },
    });

    return allZones
      .filter((z) => {
        const dist = this.haversineDistance(lat, lng, Number(z.centerLat), Number(z.centerLng));
        return dist <= radiusKm * 1000;
      })
      .map((z) => ({
        id: z.id,
        name: z.name,
        type: z.type.code,
        icaoCode: z.icaoCode,
        centerLat: Number(z.centerLat),
        centerLng: Number(z.centerLng),
        radiusM: z.radiusM,
        isPermanent: z.isPermanent,
      }));
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
