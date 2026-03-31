import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ICertificateRepository, CertificateData, CreateCertificateData } from '../../../../domain/ports/outbound';

@Injectable()
export class PrismaCertificateRepository implements ICertificateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CertificateData | null> {
    return this.prisma.certificate.findUnique({ where: { id } });
  }

  async findByPilotId(pilotId: string): Promise<CertificateData[]> {
    return this.prisma.certificate.findMany({
      where: { pilotId },
      orderBy: { expiryDate: 'desc' },
    });
  }

  async findValidByPilotId(pilotId: string): Promise<CertificateData[]> {
    return this.prisma.certificate.findMany({
      where: {
        pilotId,
        isValid: true,
        expiryDate: { gte: new Date() },
      },
    });
  }

  async create(data: CreateCertificateData): Promise<CertificateData> {
    return this.prisma.certificate.create({ data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.certificate.delete({ where: { id } });
  }
}
