import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';

import { PrismaDroneRepository } from '../adapters/outbound/persistence/prisma-drone.repository';
import { DroneServiceImpl } from '../../application/services/drone-service.impl';
import { DroneController } from '../adapters/inbound/rest/drone.controller';

@Module({
  imports: [AuthModule],
  controllers: [DroneController],
  providers: [
    { provide: INJECTION_TOKENS.DroneRepository, useClass: PrismaDroneRepository },
    { provide: INJECTION_TOKENS.DroneService, useClass: DroneServiceImpl },
  ],
  exports: [INJECTION_TOKENS.DroneRepository, INJECTION_TOKENS.DroneService],
})
export class FleetModule {}
