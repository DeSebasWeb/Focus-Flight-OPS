import { TelemetryReading } from '../../../core/value-objects';
import { TelemetrySource, ConnectionStatus } from '../../../core/enums';
import { ITelemetryManager, TelemetryStreamState } from '../../../core/ports/inbound';
import { ITelemetryProvider, IConnectionMonitor, ITelemetryCollector } from '../../../core/ports/outbound';

const BACKEND_THROTTLE_MS = 3000;

export class ManageTelemetryStreamUseCase implements ITelemetryManager {
  private activeSource: TelemetrySource = TelemetrySource.GPS_PHONE;
  private activeCleanup: (() => void) | null = null;
  private connectionCleanup: (() => void) | null = null;
  private onStateChange: ((state: TelemetryStreamState) => void) | null = null;
  private flightLogId: string | null = null;
  private lastPersistTimestamp = 0;
  private isStreaming = false;
  private lastReading: TelemetryReading | null = null;

  constructor(
    private readonly djiProvider: ITelemetryProvider,
    private readonly gpsProvider: ITelemetryProvider,
    private readonly connectionMonitor: IConnectionMonitor,
    private readonly telemetryCollector: ITelemetryCollector,
  ) {}

  startTelemetryStream(
    flightLogId: string,
    _pilotPosition: { latitude: number; longitude: number },
    onStateChange: (state: TelemetryStreamState) => void,
  ): () => void {
    this.flightLogId = flightLogId;
    this.onStateChange = onStateChange;
    this.isStreaming = true;
    this.lastPersistTimestamp = 0;
    this.lastReading = null;

    // Determine initial source based on current connection status
    const initialStatus = this.connectionMonitor.getCurrentStatus();
    if (initialStatus === ConnectionStatus.CONNECTED) {
      this.switchToProvider(this.djiProvider, TelemetrySource.DJI_DRONE);
    } else {
      this.switchToProvider(this.gpsProvider, TelemetrySource.GPS_PHONE);
    }

    // Subscribe to connection changes for auto-switching
    this.connectionCleanup = this.connectionMonitor.onConnectionChange((event) => {
      if (!this.isStreaming) return;

      if (event.status === ConnectionStatus.CONNECTED) {
        this.switchToProvider(this.djiProvider, TelemetrySource.DJI_DRONE);
      } else if (event.status === ConnectionStatus.DISCONNECTED) {
        this.switchToProvider(this.gpsProvider, TelemetrySource.GPS_PHONE);
      }

      this.emitState();
    });

    // Emit initial state
    this.emitState();

    return () => this.stopTelemetryStream();
  }

  stopTelemetryStream(): void {
    this.isStreaming = false;

    if (this.activeCleanup) {
      this.activeCleanup();
      this.activeCleanup = null;
    }

    if (this.connectionCleanup) {
      this.connectionCleanup();
      this.connectionCleanup = null;
    }

    this.onStateChange = null;
    this.flightLogId = null;
    this.lastReading = null;
  }

  getActiveSource(): TelemetrySource {
    return this.activeSource;
  }

  private switchToProvider(provider: ITelemetryProvider, source: TelemetrySource): void {
    // Stop the current provider
    if (this.activeCleanup) {
      this.activeCleanup();
      this.activeCleanup = null;
    }

    this.activeSource = source;

    // Start the new provider
    this.activeCleanup = provider.startStreaming(
      (reading) => this.handleReading(reading),
      (error) => this.handleError(error),
    );
  }

  private handleReading(reading: TelemetryReading): void {
    this.lastReading = reading;
    this.emitState();
    this.throttledPersist(reading);
  }

  private handleError(_error: Error): void {
    // If DJI fails, fall back to GPS
    if (this.activeSource === TelemetrySource.DJI_DRONE && this.isStreaming) {
      this.switchToProvider(this.gpsProvider, TelemetrySource.GPS_PHONE);
      this.emitState();
    }
  }

  private throttledPersist(reading: TelemetryReading): void {
    const now = Date.now();
    if (now - this.lastPersistTimestamp < BACKEND_THROTTLE_MS) return;
    if (!this.flightLogId) return;

    this.lastPersistTimestamp = now;

    const point = reading.toTelemetryPoint(
      crypto.randomUUID(),
      this.flightLogId,
    );
    this.telemetryCollector.saveTelemetryPoint(point).catch(() => {});
  }

  private emitState(): void {
    if (!this.onStateChange) return;

    const state: TelemetryStreamState = {
      reading: this.lastReading,
      source: this.activeSource,
      connectionStatus: this.connectionMonitor.getCurrentStatus(),
      productName: this.connectionMonitor.getProductName(),
      isStreaming: this.isStreaming,
    };

    this.onStateChange(state);
  }
}
