import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { ITelemetryRepository } from '../../domain/ports/outbound';
import { ITelemetryService, RecordTelemetryInput } from '../../domain/ports/inbound';

@Injectable()
export class TelemetryServiceImpl implements ITelemetryService {
  constructor(
    @Inject(INJECTION_TOKENS.TelemetryRepository) private readonly telemetryRepo: ITelemetryRepository,
  ) {}

  async recordPoint(flightLogId: string, data: RecordTelemetryInput) {
    return this.telemetryRepo.create({
      flightLogId,
      timestamp: new Date(data.timestamp),
      latitude: data.latitude,
      longitude: data.longitude,
      altitudeAglM: data.altitudeAglM,
      speedMs: data.speedMs,
      headingDeg: data.headingDeg,
      batteryPercent: data.batteryPercent,
      signalStrength: data.signalStrength,
      distanceFromPilotM: data.distanceFromPilotM,
      satelliteCount: data.satelliteCount,
    });
  }

  async findByFlightLogId(flightLogId: string) {
    return this.telemetryRepo.findByFlightLogId(flightLogId);
  }
}
