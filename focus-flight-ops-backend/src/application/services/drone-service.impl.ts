import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IDroneRepository } from '../../domain/ports/outbound';
import { IDroneService, CreateDroneInput } from '../../domain/ports/inbound';
import { EntityNotFoundError, UnauthorizedAccessError } from '../../domain/errors';

@Injectable()
export class DroneServiceImpl implements IDroneService {
  constructor(
    @Inject(INJECTION_TOKENS.DroneRepository) private readonly droneRepo: IDroneRepository,
  ) {}

  async findById(id: string, pilotId: string) {
    const drone = await this.droneRepo.findById(id);
    if (!drone) throw new EntityNotFoundError('Drone', id);
    if (drone.pilotId !== pilotId) throw new UnauthorizedAccessError();
    return drone;
  }

  async findByPilotId(pilotId: string) {
    return this.droneRepo.findByPilotId(pilotId);
  }

  async create(pilotId: string, data: CreateDroneInput) {
    return this.droneRepo.create({
      pilotId,
      modelId: data.modelId,
      serialNumber: data.serialNumber,
      registrationNumber: data.registrationNumber,
      mtowGrams: data.mtowGrams,
      firmwareVersion: data.firmwareVersion,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      photoUrl: data.photoUrl,
    });
  }

  async update(id: string, pilotId: string, data: Partial<CreateDroneInput>) {
    await this.findById(id, pilotId); // ownership check
    const updateData: any = { ...data };
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    delete updateData.pilotId;
    return this.droneRepo.update(id, updateData);
  }

  async delete(id: string, pilotId: string) {
    await this.findById(id, pilotId); // ownership check
    await this.droneRepo.delete(id);
  }
}
