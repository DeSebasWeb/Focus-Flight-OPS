import { EmergencyContact } from '../../entities';
import { EmergencyType } from '../../enums';

export interface EmergencyEvent {
  id: string;
  flightLogId?: string;
  pilotId: string;
  type: EmergencyType;
  triggeredAt: number;
  latitude?: number;
  longitude?: number;
  altitudeM?: number;
  description?: string;
  actionsTaken?: string[];
  resolvedAt?: number;
  atcContacted: boolean;
  atcContactName?: string;
}

export interface IEmergencyHandler {
  triggerEmergency(pilotId: string, type: EmergencyType, flightLogId?: string): Promise<EmergencyEvent>;
  getEmergencyContacts(latitude?: number, longitude?: number): Promise<EmergencyContact[]>;
  getNearestATCContact(latitude: number, longitude: number): Promise<EmergencyContact | null>;
  getFlyawayProtocol(): string[];
  logEmergencyAction(eventId: string, action: string): Promise<void>;
  resolveEmergency(eventId: string): Promise<EmergencyEvent>;
}
