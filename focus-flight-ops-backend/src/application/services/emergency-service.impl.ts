import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { IEmergencyContactRepository, IEmergencyEventRepository } from '../../domain/ports/outbound';
import { IEmergencyService, TriggerEmergencyInput, FlyawayStep } from '../../domain/ports/inbound';
import { EntityNotFoundError } from '../../domain/errors';

@Injectable()
export class EmergencyServiceImpl implements IEmergencyService {
  constructor(
    @Inject(INJECTION_TOKENS.EmergencyContactRepository) private readonly contactRepo: IEmergencyContactRepository,
    @Inject(INJECTION_TOKENS.EmergencyEventRepository) private readonly eventRepo: IEmergencyEventRepository,
  ) {}

  async getContacts() {
    return this.contactRepo.findAll();
  }

  async getNearestContacts(lat: number, lng: number) {
    const allContacts = await this.contactRepo.findAll();
    // Return ATC contacts first, then emergency services
    return allContacts.sort((a, b) => {
      if (a.role === 'ATC' && b.role !== 'ATC') return -1;
      if (a.role !== 'ATC' && b.role === 'ATC') return 1;
      return 0;
    });
  }

  async triggerEvent(pilotId: string, data: TriggerEmergencyInput) {
    return this.eventRepo.create({
      pilotId,
      type: data.type,
      flightLogId: data.flightLogId,
      triggeredAt: new Date(),
      latitude: data.latitude,
      longitude: data.longitude,
      altitudeM: data.altitudeM,
      description: data.description,
    });
  }

  async addAction(eventId: string, actionText: string) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new EntityNotFoundError('EmergencyEvent', eventId);
    await this.eventRepo.addAction(eventId, actionText);
  }

  async resolveEvent(eventId: string) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new EntityNotFoundError('EmergencyEvent', eventId);
    return this.eventRepo.update(eventId, { resolvedAt: new Date() } as any);
  }

  getFlyawayProtocol(): FlyawayStep[] {
    return [
      { order: 1, instruction: 'NO entre en panico. Mantenga la calma y siga este protocolo.', isCritical: true },
      { order: 2, instruction: 'Intente activar RTH (Return to Home) desde el control remoto.', isCritical: true },
      { order: 3, instruction: 'Si RTH no responde, intente cambiar a modo ATTI/Manual.', isCritical: true },
      { order: 4, instruction: 'Mantenga visual del drone en todo momento.', isCritical: true },
      { order: 5, instruction: 'Si el drone se aleja, registre la ultima posicion y direccion conocida.', isCritical: true },
      { order: 6, instruction: 'Contacte inmediatamente la torre de control mas cercana.', isCritical: true },
      { order: 7, instruction: 'Alerte a personas en la zona de posible caida.', isCritical: true },
      { order: 8, instruction: 'Documente todo: hora, ubicacion, condiciones, acciones tomadas.', isCritical: false },
      { order: 9, instruction: 'Reporte el incidente a la UAEAC dentro de las 72 horas.', isCritical: true },
      { order: 10, instruction: 'Preserve la evidencia: logs de vuelo, grabaciones, fotos del area.', isCritical: false },
    ];
  }
}
