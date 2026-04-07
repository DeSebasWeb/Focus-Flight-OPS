import { ConnectionStatus } from '../../enums';

export interface ConnectionEvent {
  readonly status: ConnectionStatus;
  readonly productName: string | null;
  readonly timestamp: number;
}

export interface IConnectionMonitor {
  /** Subscribes to connection state changes. Returns a cleanup function. */
  onConnectionChange(callback: (event: ConnectionEvent) => void): () => void;

  /** Returns the current connection status synchronously. */
  getCurrentStatus(): ConnectionStatus;

  /** Returns the connected product name, or null if disconnected. */
  getProductName(): string | null;
}
