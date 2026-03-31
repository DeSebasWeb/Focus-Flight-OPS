import { create } from 'zustand';
import { emergencyApi } from '../../../services/api/emergencyApi';
import { syncManager } from '../../../infrastructure/sync/SyncManager';

export interface EmergencyContactState {
  id: string;
  name: string;
  role: string;
  phone: string;
  airportCode?: string;
  region?: string;
  frequencyMhz?: number;
}

export interface FlyawayStep {
  order: number;
  instruction: string;
  isCritical: boolean;
}

interface EmergencyStore {
  contacts: EmergencyContactState[];
  isEmergencyActive: boolean;
  emergencyStartedAt: number | null;
  flyawayProtocol: FlyawayStep[];
  isLoading: boolean;

  fetchContacts: () => Promise<void>;
  fetchFlyawayProtocol: () => Promise<void>;
  activateEmergency: () => void;
  deactivateEmergency: () => void;
}

export const useEmergencyStore = create<EmergencyStore>((set) => ({
  contacts: [],
  isEmergencyActive: false,
  emergencyStartedAt: null,
  flyawayProtocol: [],
  isLoading: false,

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const result = await syncManager.fetchWithFallback<EmergencyContactState[]>(
        'emergency_contacts',
        () => emergencyApi.getContacts(),
      );
      if (result) {
        set({ contacts: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchFlyawayProtocol: async () => {
    try {
      const result = await syncManager.fetchWithFallback<FlyawayStep[]>(
        'flyaway_protocol',
        () => emergencyApi.getFlyawayProtocol(),
      );
      if (result) {
        set({ flyawayProtocol: result.data });
      }
    } catch {}
  },

  activateEmergency: () =>
    set({ isEmergencyActive: true, emergencyStartedAt: Date.now() }),

  deactivateEmergency: () =>
    set({ isEmergencyActive: false, emergencyStartedAt: null }),
}));
