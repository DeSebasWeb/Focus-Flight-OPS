import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';

import { PrismaCertificateRepository } from '../adapters/outbound/persistence/prisma-certificate.repository';
import { CertificateServiceImpl } from '../../application/services/certificate-service.impl';
import { CertificateController } from '../adapters/inbound/rest/certificate.controller';

@Module({
  imports: [AuthModule],
  controllers: [CertificateController],
  providers: [
    { provide: INJECTION_TOKENS.CertificateRepository, useClass: PrismaCertificateRepository },
    { provide: INJECTION_TOKENS.CertificateService, useClass: CertificateServiceImpl },
  ],
  exports: [INJECTION_TOKENS.CertificateRepository, INJECTION_TOKENS.CertificateService],
})
export class CertificateModule {}
