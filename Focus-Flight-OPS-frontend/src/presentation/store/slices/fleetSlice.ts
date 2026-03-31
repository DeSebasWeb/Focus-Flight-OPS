import { create } from 'zustand';
import { pilotApi } from '../../../services/api/pilotApi';
import { droneApi } from '../../../services/api/droneApi';
import { certificateApi } from '../../../services/api/certificateApi';
import { insuranceApi } from '../../../services/api/insuranceApi';

export interface DroneState {
  id: string;
  pilotId: string;
  modelId: string;
  registrationNumber?: string;
  manufacturer?: string;
  modelName?: string;
  serialNumber: string;
  mtowGrams: number;
  firmwareVersion?: string;
  isActive: boolean;
  totalFlightMinutes: number;
  photoUrl?: string;
}

export interface PilotState {
  id: string;
  userId: string;
  uaeacPilotNumber?: string;
  licenseType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface CertificateState {
  id: string;
  pilotId: string;
  type: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  isValid: boolean;
}

export interface InsuranceState {
  id: string;
  pilotId: string;
  insurerName: string;
  policyNumber: string;
  coverageAmountCop: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface FleetStore {
  pilot: PilotState | null;
  drones: DroneState[];
  certificates: CertificateState[];
  insurance: InsuranceState | null;
  selectedDroneId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchPilot: () => Promise<void>;
  fetchDrones: () => Promise<void>;
  fetchCertificates: () => Promise<void>;
  fetchInsurance: () => Promise<void>;
  fetchAll: () => Promise<void>;
  selectDrone: (id: string | null) => void;
  addDrone: (data: any) => Promise<DroneState>;
  removeDrone: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFleetStore = create<FleetStore>((set, get) => ({
  pilot: null,
  drones: [],
  certificates: [],
  insurance: null,
  selectedDroneId: null,
  isLoading: false,
  error: null,

  fetchPilot: async () => {
    try {
      const pilot = await pilotApi.getMyProfile();
      set({ pilot });
    } catch {
      set({ pilot: null });
    }
  },

  fetchDrones: async () => {
    try {
      const drones = await droneApi.list();
      set({ drones, selectedDroneId: get().selectedDroneId ?? drones[0]?.id ?? null });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchCertificates: async () => {
    try {
      const certificates = await certificateApi.list();
      set({ certificates });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchInsurance: async () => {
    try {
      const insurance = await insuranceApi.getActive();
      set({ insurance });
    } catch {
      set({ insurance: null });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchPilot(),
        get().fetchDrones(),
        get().fetchCertificates(),
        get().fetchInsurance(),
      ]);
    } finally {
      set({ isLoading: false });
    }
  },

  selectDrone: (id) => set({ selectedDroneId: id }),

  addDrone: async (data) => {
    const drone = await droneApi.create(data);
    set((s) => ({ drones: [...s.drones, drone] }));
    return drone;
  },

  removeDrone: async (id) => {
    await droneApi.remove(id);
    set((s) => ({
      drones: s.drones.filter((d) => d.id !== id),
      selectedDroneId: s.selectedDroneId === id ? null : s.selectedDroneId,
    }));
  },

  clearError: () => set({ error: null }),
}));
