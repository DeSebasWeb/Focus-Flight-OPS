import { TelemetryReading } from '../../value-objects';
import { TelemetrySource, ConnectionStatus } from '../../enums';

export interface TelemetryStreamState {
  readonly reading: TelemetryReading | null;
  readonly source: TelemetrySource;
  readonly connectionStatus: ConnectionStatus;
  readonly productName: string | null;
  readonly isStreaming: boolean;
}

export interface ITelemetryManager {
  /** Starts telemetry streaming with automatic DJI/GPS source switching. Returns a cleanup function. */
  startTelemetryStream(
    flightLogId: string,
    pilotPosition: { latitude: number; longitude: number },
    onStateChange: (state: TelemetryStreamState) => void,
  ): () => void;

  /** Stops the current telemetry stream. */
  stopTelemetryStream(): void;

  /** Returns the currently active telemetry source. */
  getActiveSource(): TelemetrySource;
}
