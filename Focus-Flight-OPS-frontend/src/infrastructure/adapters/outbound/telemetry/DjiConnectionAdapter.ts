import { Platform } from 'react-native';
import { ConnectionStatus } from '../../../../core/enums';
import { IConnectionMonitor, ConnectionEvent } from '../../../../core/ports/outbound';

type DjiModule = typeof import('../../../../../modules/expo-dji-telemetry');

let cachedModule: DjiModule | null = null;

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

export class DjiConnectionAdapter implements IConnectionMonitor {
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private productName: string | null = null;
  private initialized = false;

  onConnectionChange(callback: (event: ConnectionEvent) => void): () => void {
    let subscription: { remove(): void } | null = null;
    let stopped = false;

    const setup = async () => {
      const dji = await getDjiModule();
      if (!dji || stopped) return;

      // Initialize SDK once
      if (!this.initialized) {
        try {
          await dji.initialize();
          this.initialized = true;
        } catch {
          this.status = ConnectionStatus.ERROR;
          callback({
            status: ConnectionStatus.ERROR,
            productName: null,
            timestamp: Date.now(),
          });
          return;
        }
      }

      // Check initial status
      try {
        const connected = dji.getConnectionStatus();
        this.status = connected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;
        this.productName = connected ? dji.getProductName() : null;

        callback({
          status: this.status,
          productName: this.productName,
          timestamp: Date.now(),
        });
      } catch {
        // Module available but not ready yet
      }

      subscription = dji.addConnectionListener((event) => {
        if (stopped) return;

        this.status = event.connected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;
        this.productName = event.productName;

        callback({
          status: this.status,
          productName: this.productName,
          timestamp: Date.now(),
        });
      });
    };

    setup();

    return () => {
      stopped = true;
      subscription?.remove();
    };
  }

  getCurrentStatus(): ConnectionStatus {
    return this.status;
  }

  getProductName(): string | null {
    return this.productName;
  }
}
