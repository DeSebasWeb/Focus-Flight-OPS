import { FlightLog } from '../../../core/entities';
import { IFlightLogRepository, IDroneRepository } from '../../../core/ports/outbound';

export class EndFlightUseCase {
  constructor(
    private readonly flightLogRepo: IFlightLogRepository,
    private readonly droneRepo: IDroneRepository,
  ) {}

  async execute(
    flightLogId: string,
    landingLat: number,
    landingLng: number,
    maxAltitude?: number,
    maxDistance?: number,
  ): Promise<FlightLog> {
    const flightLog = await this.flightLogRepo.findById(flightLogId);
    if (!flightLog) {
      throw new Error(`Flight log ${flightLogId} not found`);
    }

    if (!flightLog.isInFlight) {
      throw new Error('Flight is not currently in progress');
    }

    const completedLog = flightLog.endFlight(landingLat, landingLng, maxAltitude, maxDistance);
    await this.flightLogRepo.update(completedLog);

    // Update drone flight hours
    if (completedLog.props.totalFlightMinutes) {
      const drone = await this.droneRepo.findById(completedLog.props.droneId);
      if (drone) {
        const hoursFlown = completedLog.props.totalFlightMinutes / 60;
        const updatedDrone = drone.addFlightHours(hoursFlown);
        await this.droneRepo.update(updatedDrone);
      }
    }

    return completedLog;
  }
}
