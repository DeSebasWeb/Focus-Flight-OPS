import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IMissionRepository, MissionData, CreateMissionData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaMissionRepository implements IMissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MissionData | null> {
    const m = await this.prisma.mission.findUnique({ where: { id } });
    return m ? this.toDomain(m) : null;
  }

  async findByPilotId(pilotId: string): Promise<MissionData[]> {
    const missions = await this.prisma.mission.findMany({
      where: { pilotId },
      orderBy: { plannedDate: 'desc' },
    });
    return missions.map((m) => this.toDomain(m));
  }

  async create(data: CreateMissionData): Promise<MissionData> {
    const m = await this.prisma.mission.create({ data });
    return this.toDomain(m);
  }

  async update(id: string, data: Partial<CreateMissionData>): Promise<MissionData> {
    const { pilotId, ...updateData } = data;
    const m = await this.prisma.mission.update({ where: { id }, data: updateData });
    return this.toDomain(m);
  }

  async updateStatus(id: string, status: string): Promise<MissionData> {
    const m = await this.prisma.mission.update({ where: { id }, data: { status } });
    return this.toDomain(m);
  }

  private toDomain(raw: any): MissionData {
    return {
      ...raw,
      plannedLocationLat: Number(raw.plannedLocationLat),
      plannedLocationLng: Number(raw.plannedLocationLng),
      plannedAltitudeM: raw.plannedAltitudeM ? Number(raw.plannedAltitudeM) : null,
    };
  }
}
