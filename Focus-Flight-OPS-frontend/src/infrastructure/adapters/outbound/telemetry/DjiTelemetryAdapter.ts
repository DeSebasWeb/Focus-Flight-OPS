import { Platform } from 'react-native';
import { TelemetryReading } from '../../../../core/value-objects';
import { TelemetrySource } from '../../../../core/enums';
import { ITelemetryProvider, TelemetryProviderConfig } from '../../../../core/ports/outbound';

interface DjiRawSnapshot {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeM: number;
  speedMs: number;
  headingDeg: number;
  batteryPercent: number;
  signalStrength: number;
  satelliteCount: number;
  distanceFromPilotM: number;
}

type DjiModule = typeof import('../../../../../modules/expo-dji-telemetry');

let cachedModule: DjiModule | null = null;
let lastRawSnapshot: DjiRawSnapshot | null = null;

async function getDjiModule(): Promise<DjiModule | null> {
  if (cachedModule) return cachedModule;
  if (Platform.OS !== 'android') return null;

  try {
    cachedModule = await import('../../../../../modules/expo-dji-telemetry');
    return cachedModule;
  } catch {
    return null;
  }
}

function mapRawToReading(raw: DjiRawSnapshot): TelemetryReading {
  return TelemetryReading.create({
    timestamp: raw.timestamp || Date.now(),
    latitude: raw.latitude,
    longitude: raw.longitude,
    altitudeAglM: Math.max(0, raw.altitudeM ?? 0),
    speedMs: Math.max(0, raw.speedMs ?? 0),
    headingDeg: Math.max(0, Math.min(360, raw.headingDeg ?? 0)),
    batteryPercent: Math.max(0, Math.min(100, raw.batteryPercent ?? 0)),
    signalStrength: Math.max(0, Math.min(100, raw.signalStrength ?? 0)),
    satelliteCount: Math.max(0, raw.satelliteCount ?? 0),
    distanceFromPilotM: Math.max(0, raw.distanceFromPilotM ?? 0),
  });
}

export class DjiTelemetryAdapter implements ITelemetryProvider {
  getConfig(): TelemetryProviderConfig {
    return {
      intervalMs: 100,
      source: TelemetrySource.DJI_DRONE,
    };
  }

  startStreaming(
    onReading: (reading: TelemetryReading) => void,
    onError?: (error: Error) => void,
  ): () => void {
    let subscription: { remove(): void } | null = null;
    let errorSubscription: { remove(): void } | null = null;
    let stopped = false;

    const setup = async () => {
      const dji = await getDjiModule();
      if (!dji || stopped) return;

      try {
        await dji.initialize();
        await dji.startTelemetryListeners();

        subscription = dji.addTelemetryListener((raw) => {
          if (stopped) return;
          lastRawSnapshot = raw as DjiRawSnapshot;

          try {
            onReading(mapRawToReading(lastRawSnapshot));
          } catch (err) {
            if (onError) onError(err instanceof Error ? err : new Error(String(err)));
          }
        });

        errorSubscription = dji.addErrorListener((err) => {
          if (!stopped && onError) onError(new Error(`DJI SDK: ${err.code} - ${err.message}`));
        });
      } catch (err) {
        if (!stopped && onError) onError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    setup();

    return () => {
      stopped = true;
      subscription?.remove();
      errorSubscription?.remove();

      getDjiModule().then((dji) => {
        dji?.stopTelemetryListeners();
      }).catch(() => {});
    };
  }

  async getCurrentReading(): Promise<TelemetryReading> {
    if (lastRawSnapshot) {
      return mapRawToReading(lastRawSnapshot);
    }
    throw new Error('No DJI telemetry data available. Ensure drone is connected.');
  }
}
