import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IFlightLogRepository, IDroneRepository } from '../../domain/ports/outbound';
import { IFlightLogService, StartFlightInput, EndFlightInput } from '../../domain/ports/inbound';
import { EntityNotFoundError, UnauthorizedAccessError } from '../../domain/errors';

@Injectable()
export class FlightLogServiceImpl implements IFlightLogService {
  constructor(
    @Inject(INJECTION_TOKENS.FlightLogRepository) private readonly flightLogRepo: IFlightLogRepository,
    @Inject(INJECTION_TOKENS.DroneRepository) private readonly droneRepo: IDroneRepository,
  ) {}

  async startFlight(pilotId: string, data: StartFlightInput) {
    return this.flightLogRepo.create({
      missionId: data.missionId,
      pilotId,
      droneId: data.droneId,
      takeoffTime: new Date(),
      takeoffLat: data.takeoffLat,
      takeoffLng: data.takeoffLng,
      takeoffAltitudeM: data.takeoffAltitudeM,
      operationType: data.operationType,
      source: 'MANUAL',
    });
  }

  async endFlight(id: string, pilotId: string, data: EndFlightInput) {
    const log = await this.findById(id, pilotId);
    const landingTime = new Date();
    const takeoffMs = new Date(log.takeoffTime).getTime();
    const totalMinutes = (landingTime.getTime() - takeoffMs) / 60000;

    const updated = await this.flightLogRepo.update(id, {
      landingTime,
      landingLat: data.landingLat,
      landingLng: data.landingLng,
      maxAltitudeAglM: data.maxAltitudeAglM,
      maxDistanceM: data.maxDistanceM,
      totalFlightMinutes: Math.round(totalMinutes * 100) / 100,
      status: 'COMPLETED',
      notes: data.notes,
    } as any);

    // Update drone total flight minutes (SRP: drone stats update)
    if (updated.totalFlightMinutes) {
      const drone = await this.droneRepo.findById(updated.droneId);
      if (drone) {
        const newTotal = drone.totalFlightMinutes + updated.totalFlightMinutes;
        await this.droneRepo.update(drone.id, { totalFlightMinutes: newTotal } as any);
      }
    }

    return updated;
  }

  async findById(id: string, pilotId: string) {
    const log = await this.flightLogRepo.findById(id);
    if (!log) throw new EntityNotFoundError('FlightLog', id);
    if (log.pilotId !== pilotId) throw new UnauthorizedAccessError();
    return log;
  }

  async findByPilotId(pilotId: string) {
    return this.flightLogRepo.findByPilotId(pilotId);
  }

  async importFromCsv(pilotId: string, csvContent: string) {
    // Placeholder - will be implemented with DJI integration in Phase 4
    return [];
  }
}
