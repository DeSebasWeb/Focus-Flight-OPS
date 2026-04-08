import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * NOAA Space Weather Prediction Center - Planetary K-index
 *
 * The Kp index measures geomagnetic disturbance (0-9 scale).
 * Affects GPS accuracy, compass reliability, and radio link quality for drones.
 *
 * Kp 0-3: Quiet - no impact on drone operations
 * Kp 4:   Unsettled - minor GPS degradation possible
 * Kp 5:   Storm (G1) - GPS accuracy reduced, compass may drift
 * Kp 6:   Storm (G2) - significant GPS issues, avoid precision work
 * Kp 7+:  Severe (G3+) - DO NOT FLY - risk of flyaway
 *
 * API: https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json
 * Public, no API key required. Data every 3 hours.
 */

export interface KpIndexData {
  current: number;
  timestamp: string;
  status: 'observed' | 'estimated' | 'predicted';
  noaaScale: string | null;
  level: 'quiet' | 'unsettled' | 'storm' | 'severe' | 'extreme';
  flyable: boolean;
  message: string;
  forecast: KpForecastPoint[];
}

export interface KpForecastPoint {
  timestamp: string;
  kp: number;
  status: string;
  noaaScale: string | null;
}

// Cache for 30 minutes - Kp data updates every 3 hours
let cache: { data: KpIndexData; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000;

function getKpLevel(kp: number): KpIndexData['level'] {
  if (kp < 4) return 'quiet';
  if (kp < 5) return 'unsettled';
  if (kp < 7) return 'storm';
  if (kp < 8) return 'severe';
  return 'extreme';
}

function getKpMessage(kp: number): string {
  if (kp < 4) return 'Actividad geomagnetica tranquila. GPS y compas estables.';
  if (kp < 5) return 'Actividad geomagnetica inestable. Posible degradacion menor de GPS.';
  if (kp < 6) return 'Tormenta geomagnetica G1. Precision GPS reducida. Evitar trabajos de precision.';
  if (kp < 7) return 'Tormenta geomagnetica G2. GPS significativamente afectado. Precaucion extrema.';
  if (kp < 8) return 'Tormenta severa G3. Riesgo de flyaway. NO VOLAR.';
  return 'Tormenta extrema G4+. Prohibido volar. Riesgo critico para sistemas electronicos.';
}

@Injectable()
export class NoaaKpIndexAdapter {
  private readonly logger = new Logger(NoaaKpIndexAdapter.name);

  async getCurrentKpIndex(): Promise<KpIndexData> {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
      return cache.data;
    }

    try {
      const response = await axios.get(
        'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
        { timeout: 10000 },
      );

      const rawData = response.data;

      // NOAA API returns array of objects: { time_tag, kp, observed, noaa_scale }
      const entries: Array<{ time_tag: string; kp: number; observed: string; noaa_scale: string | null }> = rawData;

      const now = Date.now();
      let currentEntry: typeof entries[0] | null = null;
      const forecast: KpForecastPoint[] = [];

      for (const entry of entries) {
        const rowTime = new Date(entry.time_tag).getTime();
        const kp = entry.kp;
        const status = entry.observed;

        // Find the most recent observed/estimated entry
        if (rowTime <= now && (status === 'observed' || status === 'estimated')) {
          currentEntry = entry;
        }

        // Collect forecast (next 24 hours)
        if (rowTime > now && rowTime <= now + 24 * 60 * 60 * 1000) {
          forecast.push({
            timestamp: entry.time_tag,
            kp,
            status,
            noaaScale: entry.noaa_scale || null,
          });
        }
      }

      // If no current found, use the latest entry before now
      if (!currentEntry && entries.length > 0) {
        for (let i = entries.length - 1; i >= 0; i--) {
          const rowTime = new Date(entries[i].time_tag).getTime();
          if (rowTime <= now) {
            currentEntry = entries[i];
            break;
          }
        }
      }

      if (!currentEntry) {
        currentEntry = entries[entries.length - 1];
      }

      const kp = currentEntry.kp;
      const level = getKpLevel(kp);

      const result: KpIndexData = {
        current: Math.round(kp * 100) / 100,
        timestamp: currentEntry.time_tag,
        status: currentEntry.observed as any,
        noaaScale: currentEntry.noaa_scale || null,
        level,
        flyable: kp < 7,
        message: getKpMessage(kp),
        forecast: forecast.slice(0, 8), // Next 24h (8 x 3h intervals)
      };

      cache = { data: result, timestamp: now };
      return result;
    } catch (error) {
      this.logger.warn(`Failed to fetch Kp index: ${(error as Error).message}`);

      // Return safe default if API fails
      return {
        current: 0,
        timestamp: new Date().toISOString(),
        status: 'estimated',
        noaaScale: null,
        level: 'quiet',
        flyable: true,
        message: 'Datos geomagneticos no disponibles. Verificar manualmente.',
        forecast: [],
      };
    }
  }
}
