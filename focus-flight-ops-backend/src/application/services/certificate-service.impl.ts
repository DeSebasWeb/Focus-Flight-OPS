import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { ICertificateRepository } from '../../domain/ports/outbound';
import { ICertificateService, CreateCertificateInput } from '../../domain/ports/inbound';
import { EntityNotFoundError, UnauthorizedAccessError } from '../../domain/errors';

@Injectable()
export class CertificateServiceImpl implements ICertificateService {
  constructor(
    @Inject(INJECTION_TOKENS.CertificateRepository) private readonly certRepo: ICertificateRepository,
  ) {}

  async findByPilotId(pilotId: string) {
    return this.certRepo.findByPilotId(pilotId);
  }

  async create(pilotId: string, data: CreateCertificateInput) {
    return this.certRepo.create({
      pilotId,
      type: data.type,
      certificateNumber: data.certificateNumber,
      issuingAuthority: data.issuingAuthority,
      issueDate: new Date(data.issueDate),
      expiryDate: new Date(data.expiryDate),
      documentUrl: data.documentUrl,
    });
  }

  async delete(id: string, pilotId: string) {
    const cert = await this.certRepo.findById(id);
    if (!cert) throw new EntityNotFoundError('Certificate', id);
    if (cert.pilotId !== pilotId) throw new UnauthorizedAccessError();
    await this.certRepo.delete(id);
  }

  async checkExpiry(pilotId: string) {
    const certs = await this.certRepo.findByPilotId(pilotId);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return certs.filter(
      (c) => c.isValid && new Date(c.expiryDate) <= thirtyDaysFromNow,
    );
  }
}
