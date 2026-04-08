import * as Location from 'expo-location';
import { TelemetryReading } from '../../../../core/value-objects';
import { TelemetrySource } from '../../../../core/enums';
import { ITelemetryProvider, TelemetryProviderConfig } from '../../../../core/ports/outbound';

const POLLING_INTERVAL_MS = 3000;

export class ExpoLocationTelemetryAdapter implements ITelemetryProvider {
  getConfig(): TelemetryProviderConfig {
    return {
      intervalMs: POLLING_INTERVAL_MS,
      source: TelemetrySource.GPS_PHONE,
    };
  }

  startStreaming(
    onReading: (reading: TelemetryReading) => void,
    onError?: (error: Error) => void,
  ): () => void {
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const reading = await this.getCurrentReading();
        if (!stopped) onReading(reading);
      } catch (err) {
        if (!stopped && onError) onError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    // Initial poll immediately
    poll();
    const intervalId = setInterval(poll, POLLING_INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(intervalId);
    };
  }

  async getCurrentReading(): Promise<TelemetryReading> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return TelemetryReading.create({
      timestamp: Date.now(),
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      altitudeAglM: Math.max(0, loc.coords.altitude ?? 0),
      speedMs: Math.max(0, loc.coords.speed ?? 0),
      headingDeg: Math.max(0, Math.min(360, loc.coords.heading ?? 0)),
      batteryPercent: 0,
      signalStrength: 0,
      satelliteCount: 0,
      distanceFromPilotM: 0,
    });
  }
}
