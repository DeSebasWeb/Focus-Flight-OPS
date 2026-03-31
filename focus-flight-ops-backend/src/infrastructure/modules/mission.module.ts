import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';
import { PrismaMissionRepository } from '../adapters/outbound/persistence/prisma-mission.repository';
import { MissionServiceImpl } from '../../application/services/mission-service.impl';
import { MissionController } from '../adapters/inbound/rest/mission.controller';

@Module({
  imports: [AuthModule],
  controllers: [MissionController],
  providers: [
    { provide: INJECTION_TOKENS.MissionRepository, useClass: PrismaMissionRepository },
    { provide: INJECTION_TOKENS.MissionService, useClass: MissionServiceImpl },
  ],
  exports: [INJECTION_TOKENS.MissionRepository, INJECTION_TOKENS.MissionService],
})
export class MissionModule {}
