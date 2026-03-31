import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IDroneRepository, DroneData, CreateDroneData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaDroneRepository implements IDroneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DroneData | null> {
    const drone = await this.prisma.drone.findUnique({
      where: { id },
      include: { model: { include: { manufacturer: true } } },
    });
    return drone ? this.toDomain(drone) : null;
  }

  async findByPilotId(pilotId: string): Promise<DroneData[]> {
    const drones = await this.prisma.drone.findMany({
      where: { pilotId },
      include: { model: { include: { manufacturer: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return drones.map((d) => this.toDomain(d));
  }

  async findBySerialNumber(serial: string): Promise<DroneData | null> {
    const drone = await this.prisma.drone.findUnique({
      where: { serialNumber: serial },
      include: { model: { include: { manufacturer: true } } },
    });
    return drone ? this.toDomain(drone) : null;
  }

  async create(data: CreateDroneData): Promise<DroneData> {
    const drone = await this.prisma.drone.create({
      data: {
        pilotId: data.pilotId,
        modelId: data.modelId,
        serialNumber: data.serialNumber,
        registrationNumber: data.registrationNumber,
        mtowGrams: data.mtowGrams,
        firmwareVersion: data.firmwareVersion,
        purchaseDate: data.purchaseDate,
        photoUrl: data.photoUrl,
      },
      include: { model: { include: { manufacturer: true } } },
    });
    return this.toDomain(drone);
  }

  async update(id: string, data: Partial<CreateDroneData>): Promise<DroneData> {
    const { pilotId, ...updateData } = data;
    const drone = await this.prisma.drone.update({
      where: { id },
      data: updateData,
      include: { model: { include: { manufacturer: true } } },
    });
    return this.toDomain(drone);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.drone.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toDomain(raw: any): DroneData {
    return {
      id: raw.id,
      pilotId: raw.pilotId,
      modelId: raw.modelId,
      serialNumber: raw.serialNumber,
      registrationNumber: raw.registrationNumber,
      mtowGrams: raw.mtowGrams,
      firmwareVersion: raw.firmwareVersion,
      purchaseDate: raw.purchaseDate,
      photoUrl: raw.photoUrl,
      isActive: raw.isActive,
      totalFlightMinutes: Number(raw.totalFlightMinutes),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      manufacturer: raw.model?.manufacturer?.name,
      modelName: raw.model?.name,
    };
  }
}
