import { ConnectionStatus } from '../../../../core/enums';
import { IConnectionMonitor, ConnectionEvent } from '../../../../core/ports/outbound';

/**
 * Null Object pattern for platforms without DJI support (iOS, web, simulator).
 * Always reports DISCONNECTED — the use case will default to GPS provider.
 */
export class NullConnectionAdapter implements IConnectionMonitor {
  onConnectionChange(_callback: (event: ConnectionEvent) => void): () => void {
    return () => {};
  }

  getCurrentStatus(): ConnectionStatus {
    return ConnectionStatus.DISCONNECTED;
  }

  getProductName(): string | null {
    return null;
  }
}
