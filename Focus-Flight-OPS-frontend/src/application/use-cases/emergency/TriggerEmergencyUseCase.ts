import { EmergencyType } from '../../../core/enums';
import { EmergencyEvent } from '../../../core/ports/inbound';
import { ILocationProvider } from '../../../core/ports/outbound';

export interface IEmergencyEventRepository {
  save(event: EmergencyEvent): Promise<void>;
  findById(id: string): Promise<EmergencyEvent | null>;
  update(event: EmergencyEvent): Promise<void>;
}

export class TriggerEmergencyUseCase {
  constructor(
    private readonly emergencyRepo: IEmergencyEventRepository,
    private readonly locationProvider: ILocationProvider,
  ) {}

  async execute(pilotId: string, type: EmergencyType, flightLogId?: string): Promise<EmergencyEvent> {
    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const position = await this.locationProvider.getCurrentPosition();
      latitude = position.latitude;
      longitude = position.longitude;
    } catch {
      // GPS may not be available during emergency
    }

    const event: EmergencyEvent = {
      id: crypto.randomUUID(),
      flightLogId,
      pilotId,
      type,
      triggeredAt: Date.now(),
      latitude,
      longitude,
      atcContacted: false,
    };

    await this.emergencyRepo.save(event);
    return event;
  }
}
