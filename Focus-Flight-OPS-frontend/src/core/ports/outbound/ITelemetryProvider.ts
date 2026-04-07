import { TelemetryReading } from '../../value-objects';
import { TelemetrySource } from '../../enums';

export interface TelemetryProviderConfig {
  readonly intervalMs: number;
  readonly source: TelemetrySource;
}

export interface ITelemetryProvider {
  /** Starts producing telemetry readings. Returns a cleanup function to stop streaming. */
  startStreaming(
    onReading: (reading: TelemetryReading) => void,
    onError?: (error: Error) => void,
  ): () => void;

  /** Gets a single reading on demand. */
  getCurrentReading(): Promise<TelemetryReading>;

  /** Returns the configuration of this provider. */
  getConfig(): TelemetryProviderConfig;
}
