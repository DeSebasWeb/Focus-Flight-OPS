import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IPilotRepository, PilotData, CreatePilotData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaPilotRepository implements IPilotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PilotData | null> {
    return this.prisma.pilot.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<PilotData | null> {
    return this.prisma.pilot.findUnique({ where: { userId } });
  }

  async create(data: CreatePilotData): Promise<PilotData> {
    return this.prisma.pilot.create({ data });
  }

  async update(id: string, data: Partial<CreatePilotData>): Promise<PilotData> {
    return this.prisma.pilot.update({ where: { id }, data });
  }
}
