import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';

import { PrismaInsuranceRepository } from '../adapters/outbound/persistence/prisma-insurance.repository';
import { InsuranceServiceImpl } from '../../application/services/insurance-service.impl';
import { InsuranceController } from '../adapters/inbound/rest/insurance.controller';

@Module({
  imports: [AuthModule],
  controllers: [InsuranceController],
  providers: [
    { provide: INJECTION_TOKENS.InsuranceRepository, useClass: PrismaInsuranceRepository },
    { provide: INJECTION_TOKENS.InsuranceService, useClass: InsuranceServiceImpl },
  ],
  exports: [INJECTION_TOKENS.InsuranceRepository, INJECTION_TOKENS.InsuranceService],
})
export class InsuranceModule {}
