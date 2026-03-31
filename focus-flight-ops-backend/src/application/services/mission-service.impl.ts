import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IMissionRepository } from '../../domain/ports/outbound';
import { IMissionService, CreateMissionInput } from '../../domain/ports/inbound';
import { EntityNotFoundError, UnauthorizedAccessError } from '../../domain/errors';

@Injectable()
export class MissionServiceImpl implements IMissionService {
  constructor(
    @Inject(INJECTION_TOKENS.MissionRepository) private readonly missionRepo: IMissionRepository,
  ) {}

  async findById(id: string, pilotId: string) {
    const mission = await this.missionRepo.findById(id);
    if (!mission) throw new EntityNotFoundError('Mission', id);
    if (mission.pilotId !== pilotId) throw new UnauthorizedAccessError();
    return mission;
  }

  async findByPilotId(pilotId: string) {
    return this.missionRepo.findByPilotId(pilotId);
  }

  async create(pilotId: string, data: CreateMissionInput) {
    return this.missionRepo.create({
      pilotId,
      droneId: data.droneId,
      purposeId: data.purposeId,
      name: data.name,
      purposeDetail: data.purposeDetail,
      plannedDate: new Date(data.plannedDate),
      plannedLocationLat: data.plannedLocationLat,
      plannedLocationLng: data.plannedLocationLng,
      plannedLocationName: data.plannedLocationName,
      plannedAltitudeM: data.plannedAltitudeM,
      operationType: data.operationType,
    });
  }

  async update(id: string, pilotId: string, data: Partial<CreateMissionInput>) {
    await this.findById(id, pilotId);
    const updateData: any = { ...data };
    if (data.plannedDate) updateData.plannedDate = new Date(data.plannedDate);
    return this.missionRepo.update(id, updateData);
  }

  async updateStatus(id: string, pilotId: string, status: string) {
    await this.findById(id, pilotId);
    return this.missionRepo.updateStatus(id, status);
  }
}
