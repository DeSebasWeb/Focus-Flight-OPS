import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IInsuranceRepository } from '../../domain/ports/outbound';
import { IInsuranceService, CreateInsuranceInput } from '../../domain/ports/inbound';
import { EntityNotFoundError, UnauthorizedAccessError } from '../../domain/errors';

@Injectable()
export class InsuranceServiceImpl implements IInsuranceService {
  constructor(
    @Inject(INJECTION_TOKENS.InsuranceRepository) private readonly insuranceRepo: IInsuranceRepository,
  ) {}

  async findByPilotId(pilotId: string) {
    return this.insuranceRepo.findByPilotId(pilotId);
  }

  async findActive(pilotId: string) {
    return this.insuranceRepo.findActiveByPilotId(pilotId);
  }

  async create(pilotId: string, data: CreateInsuranceInput) {
    return this.insuranceRepo.create({
      pilotId,
      insurerName: data.insurerName,
      policyNumber: data.policyNumber,
      coverageType: data.coverageType,
      coverageAmountCop: data.coverageAmountCop,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      documentUrl: data.documentUrl,
    });
  }

  async update(id: string, pilotId: string, data: Partial<CreateInsuranceInput>) {
    const policy = await this.insuranceRepo.findById(id);
    if (!policy) throw new EntityNotFoundError('InsurancePolicy', id);
    if (policy.pilotId !== pilotId) throw new UnauthorizedAccessError();

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    return this.insuranceRepo.update(id, updateData);
  }
}
