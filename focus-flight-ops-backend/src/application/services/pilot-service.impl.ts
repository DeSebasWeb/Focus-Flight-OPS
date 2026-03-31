import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IPilotRepository } from '../../domain/ports/outbound';
import { IPilotService, CreatePilotInput } from '../../domain/ports/inbound';
import { EntityNotFoundError } from '../../domain/errors';

@Injectable()
export class PilotServiceImpl implements IPilotService {
  constructor(
    @Inject(INJECTION_TOKENS.PilotRepository) private readonly pilotRepo: IPilotRepository,
  ) {}

  async findByUserId(userId: string) {
    return this.pilotRepo.findByUserId(userId);
  }

  async create(userId: string, data: CreatePilotInput) {
    return this.pilotRepo.create({
      userId,
      licenseType: data.licenseType,
      uaeacPilotNumber: data.uaeacPilotNumber,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
    });
  }

  async update(pilotId: string, data: Partial<CreatePilotInput>) {
    const pilot = await this.pilotRepo.findById(pilotId);
    if (!pilot) throw new EntityNotFoundError('Pilot', pilotId);
    return this.pilotRepo.update(pilotId, data);
  }
}
