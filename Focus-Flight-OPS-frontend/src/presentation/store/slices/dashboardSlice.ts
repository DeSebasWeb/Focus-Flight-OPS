import { create } from 'zustand';
import { weatherApi } from '../../../services/api/weatherApi';
import { certificateApi } from '../../../services/api/certificateApi';

export interface WeatherSummary {
  temperatureC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  humidityPercent: number;
  visibility: string;
  thunderstorm: boolean;
  precipitation: boolean;
  cloudCoverPercent: number;
}

export interface KpIndexSummary {
  current: number;
  level: 'quiet' | 'unsettled' | 'storm' | 'severe' | 'extreme';
  flyable: boolean;
  message: string;
  noaaScale: string | null;
  forecast: Array<{ timestamp: string; kp: number }>;
}

export interface ExpiringItem {
  id: string;
  type: 'certificate' | 'insurance';
  name: string;
  expiryDate: string;
  daysRemaining: number;
}

interface DashboardStore {
  weather: WeatherSummary | null;
  kpIndex: KpIndexSummary | null;
  expiringItems: ExpiringItem[];
  isLoadingWeather: boolean;
  isLoadingKp: boolean;
  isLoadingExpiring: boolean;
  lastLocation: { lat: number; lng: number } | null;

  fetchWeather: (lat: number, lng: number) => Promise<void>;
  fetchKpIndex: () => Promise<void>;
  fetchExpiring: () => Promise<void>;
  setLocation: (lat: number, lng: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  weather: null,
  kpIndex: null,
  expiringItems: [],
  isLoadingWeather: false,
  isLoadingKp: false,
  isLoadingExpiring: false,
  lastLocation: null,

  fetchWeather: async (lat, lng) => {
    set({ isLoadingWeather: true });
    try {
      const data = await weatherApi.getCurrent(lat, lng);
      set({
        weather: {
          temperatureC: data.temperatureC,
          windSpeedKmh: data.windSpeedKmh,
          windGustKmh: data.windGustKmh,
          humidityPercent: data.humidityPercent,
          visibility: data.visibility,
          thunderstorm: data.thunderstorm,
          precipitation: data.precipitation,
          cloudCoverPercent: data.cloudCoverPercent,
        },
        isLoadingWeather: false,
      });
    } catch {
      set({ isLoadingWeather: false });
    }
  },

  fetchKpIndex: async () => {
    set({ isLoadingKp: true });
    try {
      const data = await weatherApi.getKpIndex();
      set({
        kpIndex: {
          current: data.current,
          level: data.level,
          flyable: data.flyable,
          message: data.message,
          noaaScale: data.noaaScale,
          forecast: data.forecast?.slice(0, 8) || [],
        },
        isLoadingKp: false,
      });
    } catch {
      set({ isLoadingKp: false });
    }
  },

  fetchExpiring: async () => {
    set({ isLoadingExpiring: true });
    try {
      const certs = await certificateApi.checkExpiry();
      const items: ExpiringItem[] = (Array.isArray(certs) ? certs : []).map((c: any) => {
        const daysRemaining = Math.ceil(
          (new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return {
          id: c.id,
          type: 'certificate' as const,
          name: `Certificado ${c.type}`,
          expiryDate: c.expiryDate,
          daysRemaining,
        };
      });
      set({ expiringItems: items, isLoadingExpiring: false });
    } catch {
      set({ isLoadingExpiring: false });
    }
  },

  setLocation: (lat, lng) => set({ lastLocation: { lat, lng } }),
}));
