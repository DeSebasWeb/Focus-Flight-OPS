import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ITelemetryRepository, TelemetryData, CreateTelemetryData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaTelemetryRepository implements ITelemetryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTelemetryData): Promise<TelemetryData> {
    const point = await this.prisma.telemetryPoint.create({ data });
    return this.toDomain(point);
  }

  async findByFlightLogId(flightLogId: string): Promise<TelemetryData[]> {
    const points = await this.prisma.telemetryPoint.findMany({
      where: { flightLogId },
      orderBy: { timestamp: 'asc' },
    });
    return points.map((p) => this.toDomain(p));
  }

  private toDomain(raw: any): TelemetryData {
    return {
      ...raw,
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      altitudeAglM: raw.altitudeAglM ? Number(raw.altitudeAglM) : null,
      speedMs: raw.speedMs ? Number(raw.speedMs) : null,
      headingDeg: raw.headingDeg ? Number(raw.headingDeg) : null,
      distanceFromPilotM: raw.distanceFromPilotM ? Number(raw.distanceFromPilotM) : null,
    };
  }
}
