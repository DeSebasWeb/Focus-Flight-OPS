import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';
import { FleetModule } from './fleet.module';
import { PrismaFlightLogRepository } from '../adapters/outbound/persistence/prisma-flight-log.repository';
import { PrismaTelemetryRepository } from '../adapters/outbound/persistence/prisma-telemetry.repository';
import { FlightLogServiceImpl } from '../../application/services/flight-log-service.impl';
import { TelemetryServiceImpl } from '../../application/services/telemetry-service.impl';
import { FlightLogController } from '../adapters/inbound/rest/flight-log.controller';

@Module({
  imports: [AuthModule, FleetModule],
  controllers: [FlightLogController],
  providers: [
    { provide: INJECTION_TOKENS.FlightLogRepository, useClass: PrismaFlightLogRepository },
    { provide: INJECTION_TOKENS.TelemetryRepository, useClass: PrismaTelemetryRepository },
    { provide: INJECTION_TOKENS.FlightLogService, useClass: FlightLogServiceImpl },
    { provide: INJECTION_TOKENS.TelemetryService, useClass: TelemetryServiceImpl },
  ],
  exports: [INJECTION_TOKENS.FlightLogRepository, INJECTION_TOKENS.FlightLogService, INJECTION_TOKENS.TelemetryService],
})
export class FlightLogModule {}
