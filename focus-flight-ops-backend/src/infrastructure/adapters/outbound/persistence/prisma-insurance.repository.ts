import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IInsuranceRepository, InsuranceData, CreateInsuranceData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaInsuranceRepository implements IInsuranceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<InsuranceData | null> {
    const policy = await this.prisma.insurancePolicy.findUnique({ where: { id } });
    return policy ? this.toDomain(policy) : null;
  }

  async findByPilotId(pilotId: string): Promise<InsuranceData[]> {
    const policies = await this.prisma.insurancePolicy.findMany({
      where: { pilotId },
      orderBy: { endDate: 'desc' },
    });
    return policies.map((p) => this.toDomain(p));
  }

  async findActiveByPilotId(pilotId: string): Promise<InsuranceData | null> {
    const policy = await this.prisma.insurancePolicy.findFirst({
      where: {
        pilotId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });
    return policy ? this.toDomain(policy) : null;
  }

  async create(data: CreateInsuranceData): Promise<InsuranceData> {
    const policy = await this.prisma.insurancePolicy.create({
      data: {
        pilotId: data.pilotId,
        insurerName: data.insurerName,
        policyNumber: data.policyNumber,
        coverageType: data.coverageType ?? 'RC_EXTRACONTRACTUAL',
        coverageAmountCop: data.coverageAmountCop,
        startDate: data.startDate,
        endDate: data.endDate,
        documentUrl: data.documentUrl,
      },
    });
    return this.toDomain(policy);
  }

  async update(id: string, data: Partial<CreateInsuranceData>): Promise<InsuranceData> {
    const { pilotId, ...updateData } = data;
    const policy = await this.prisma.insurancePolicy.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(policy);
  }

  private toDomain(raw: any): InsuranceData {
    return {
      ...raw,
      coverageAmountCop: Number(raw.coverageAmountCop),
    };
  }
}
