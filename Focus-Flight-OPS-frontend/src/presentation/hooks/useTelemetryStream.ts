import { useState, useEffect } from 'react';
import { TelemetrySource, ConnectionStatus } from '../../core/enums';
import type { TelemetryStreamState } from '../../core/ports/inbound';
import type { TelemetryReading } from '../../core/value-objects';
import { container, DI_TOKENS } from '../../infrastructure/di/Container';
import type { ITelemetryManager } from '../../core/ports/inbound';

interface UseTelemetryStreamResult {
  reading: TelemetryReading | null;
  source: TelemetrySource;
  connectionStatus: ConnectionStatus;
  productName: string | null;
  isStreaming: boolean;
}

/**
 * Presentation hook that consumes the ITelemetryManager inbound port.
 * Resolves the use case via DI container — never imports infrastructure directly.
 *
 * Auto-switches between DJI (100ms) and GPS (3s) based on drone connection state.
 */
export function useTelemetryStream(
  flightLogId: string | null,
  pilotPosition: { latitude: number; longitude: number } | null,
): UseTelemetryStreamResult {
  const [state, setState] = useState<TelemetryStreamState | null>(null);

  useEffect(() => {
    if (!flightLogId || !pilotPosition) return;

    let manager: ITelemetryManager;
    try {
      manager = container.resolve<ITelemetryManager>(DI_TOKENS.ManageTelemetryStream);
    } catch {
      // DI container not initialized — telemetry stream unavailable
      return;
    }

    const cleanup = manager.startTelemetryStream(
      flightLogId,
      pilotPosition,
      setState,
    );

    return cleanup;
  }, [flightLogId, pilotPosition?.latitude, pilotPosition?.longitude]);

  return {
    reading: state?.reading ?? null,
    source: state?.source ?? TelemetrySource.GPS_PHONE,
    connectionStatus: state?.connectionStatus ?? ConnectionStatus.DISCONNECTED,
    productName: state?.productName ?? null,
    isStreaming: state?.isStreaming ?? false,
  };
}
