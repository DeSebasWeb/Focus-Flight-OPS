import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  IEmergencyContactRepository,
  IEmergencyEventRepository,
  EmergencyContactData,
  EmergencyEventData,
  CreateEmergencyEventData,
} from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaEmergencyContactRepository implements IEmergencyContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmergencyContactData[]> {
    const contacts = await this.prisma.emergencyContact.findMany({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
    return contacts.map((c) => ({
      ...c,
      frequencyMhz: c.frequencyMhz ? Number(c.frequencyMhz) : null,
    }));
  }

  async findByRegion(region: string): Promise<EmergencyContactData[]> {
    const contacts = await this.prisma.emergencyContact.findMany({
      where: { region },
      orderBy: { role: 'asc' },
    });
    return contacts.map((c) => ({
      ...c,
      frequencyMhz: c.frequencyMhz ? Number(c.frequencyMhz) : null,
    }));
  }
}

@Injectable()
export class PrismaEmergencyEventRepository implements IEmergencyEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmergencyEventData): Promise<EmergencyEventData> {
    const event = await this.prisma.emergencyEvent.create({ data });
    return this.toDomain(event);
  }

  async findById(id: string): Promise<EmergencyEventData | null> {
    const event = await this.prisma.emergencyEvent.findUnique({ where: { id } });
    return event ? this.toDomain(event) : null;
  }

  async update(id: string, data: Partial<EmergencyEventData>): Promise<EmergencyEventData> {
    const { id: _, ...updateData } = data as any;
    const event = await this.prisma.emergencyEvent.update({ where: { id }, data: updateData });
    return this.toDomain(event);
  }

  async addAction(eventId: string, actionText: string): Promise<void> {
    await this.prisma.emergencyEventAction.create({
      data: { eventId, actionText },
    });
  }

  private toDomain(raw: any): EmergencyEventData {
    return {
      ...raw,
      latitude: raw.latitude ? Number(raw.latitude) : null,
      longitude: raw.longitude ? Number(raw.longitude) : null,
      altitudeM: raw.altitudeM ? Number(raw.altitudeM) : null,
    };
  }
}
