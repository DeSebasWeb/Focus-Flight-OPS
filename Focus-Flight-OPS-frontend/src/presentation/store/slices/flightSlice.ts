import { create } from 'zustand';
import { flightLogApi } from '../../../services/api/flightLogApi';

export interface FlightLogEntry {
  id: string;
  missionId: string;
  pilotId: string;
  droneId: string;
  takeoffTime: string;
  landingTime?: string;
  totalFlightMinutes?: number;
  takeoffLat: number;
  takeoffLng: number;
  landingLat?: number;
  landingLng?: number;
  maxAltitudeAglM?: number;
  maxDistanceM?: number;
  operationType: string;
  status: string;
  notes?: string;
  source: string;
}

export interface TelemetryData {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeM: number;
  speedMs: number;
  headingDeg?: number;
  batteryPercent: number;
  signalStrength: number;
  distanceFromPilotM: number;
  satelliteCount: number;
}

interface FlightStore {
  flightLogs: FlightLogEntry[];
  activeFlight: FlightLogEntry | null;
  currentTelemetry: TelemetryData | null;
  isRecording: boolean;
  isLoading: boolean;

  fetchFlightLogs: () => Promise<void>;
  startFlight: (data: any) => Promise<FlightLogEntry>;
  endFlight: (id: string, data: any) => Promise<void>;
  updateTelemetry: (data: TelemetryData) => void;
  sendTelemetry: (flightLogId: string, data: any) => Promise<void>;
}

export const useFlightStore = create<FlightStore>((set, get) => ({
  flightLogs: [],
  activeFlight: null,
  currentTelemetry: null,
  isRecording: false,
  isLoading: false,

  fetchFlightLogs: async () => {
    set({ isLoading: true });
    try {
      const logs = await flightLogApi.list();
      set({ flightLogs: logs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  startFlight: async (data) => {
    const log = await flightLogApi.startFlight(data);
    set({ activeFlight: log, isRecording: true });
    return log;
  },

  endFlight: async (id, data) => {
    const completed = await flightLogApi.endFlight(id, data);
    set((s) => ({
      activeFlight: null,
      isRecording: false,
      currentTelemetry: null,
      flightLogs: [completed, ...s.flightLogs],
    }));
  },

  updateTelemetry: (data) => set({ currentTelemetry: data }),

  sendTelemetry: async (flightLogId, data) => {
    await flightLogApi.recordTelemetry(flightLogId, data);
  },
}));
