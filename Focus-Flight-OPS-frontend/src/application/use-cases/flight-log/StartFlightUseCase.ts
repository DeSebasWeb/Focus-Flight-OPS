import { FlightLog } from '../../../core/entities';
import { OperationType, RegulatoryVersion } from '../../../core/enums';
import { IFlightLogRepository } from '../../../core/ports/outbound';

export class StartFlightUseCase {
  constructor(private readonly flightLogRepo: IFlightLogRepository) {}

  async execute(
    missionId: string,
    pilotId: string,
    droneId: string,
    latitude: number,
    longitude: number,
    operationType: OperationType = OperationType.VLOS,
  ): Promise<FlightLog> {
    const now = Date.now();
    const flightLog = new FlightLog({
      id: crypto.randomUUID(),
      missionId,
      pilotId,
      droneId,
      takeoffTime: new Date(now).toISOString(),
      takeoffLat: latitude,
      takeoffLng: longitude,
      operationType,
      status: 'IN_FLIGHT',
      regulatoryVersion: RegulatoryVersion.RAC100,
      createdAt: now,
      updatedAt: now,
    });

    await this.flightLogRepo.save(flightLog);
    return flightLog;
  }
}
