import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';
import { PrismaEmergencyContactRepository, PrismaEmergencyEventRepository } from '../adapters/outbound/persistence/prisma-emergency.repository';
import { EmergencyServiceImpl } from '../../application/services/emergency-service.impl';
import { EmergencyController } from '../adapters/inbound/rest/emergency.controller';

@Module({
  imports: [AuthModule],
  controllers: [EmergencyController],
  providers: [
    { provide: INJECTION_TOKENS.EmergencyContactRepository, useClass: PrismaEmergencyContactRepository },
    { provide: INJECTION_TOKENS.EmergencyEventRepository, useClass: PrismaEmergencyEventRepository },
    { provide: INJECTION_TOKENS.EmergencyService, useClass: EmergencyServiceImpl },
  ],
  exports: [INJECTION_TOKENS.EmergencyService],
})
export class EmergencyModule {}
