import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IFlightLogRepository, FlightLogData, CreateFlightLogData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaFlightLogRepository implements IFlightLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<FlightLogData | null> {
    const log = await this.prisma.flightLog.findUnique({ where: { id } });
    return log ? this.toDomain(log) : null;
  }

  async findByPilotId(pilotId: string): Promise<FlightLogData[]> {
    const logs = await this.prisma.flightLog.findMany({
      where: { pilotId },
      orderBy: { takeoffTime: 'desc' },
    });
    return logs.map((l) => this.toDomain(l));
  }

  async findByMissionId(missionId: string): Promise<FlightLogData[]> {
    const logs = await this.prisma.flightLog.findMany({
      where: { missionId },
      orderBy: { takeoffTime: 'desc' },
    });
    return logs.map((l) => this.toDomain(l));
  }

  async create(data: CreateFlightLogData): Promise<FlightLogData> {
    const log = await this.prisma.flightLog.create({ data });
    return this.toDomain(log);
  }

  async update(id: string, data: Partial<FlightLogData>): Promise<FlightLogData> {
    const { id: _, createdAt, updatedAt, ...updateData } = data as any;
    const log = await this.prisma.flightLog.update({ where: { id }, data: updateData });
    return this.toDomain(log);
  }

  private toDomain(raw: any): FlightLogData {
    return {
      ...raw,
      takeoffLat: Number(raw.takeoffLat),
      takeoffLng: Number(raw.takeoffLng),
      takeoffAltitudeM: raw.takeoffAltitudeM ? Number(raw.takeoffAltitudeM) : null,
      landingLat: raw.landingLat ? Number(raw.landingLat) : null,
      landingLng: raw.landingLng ? Number(raw.landingLng) : null,
      maxAltitudeAglM: raw.maxAltitudeAglM ? Number(raw.maxAltitudeAglM) : null,
      maxDistanceM: raw.maxDistanceM ? Number(raw.maxDistanceM) : null,
      totalFlightMinutes: raw.totalFlightMinutes ? Number(raw.totalFlightMinutes) : null,
    };
  }
}
