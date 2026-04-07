/**
 * Dependency Injection Container
 *
 * Wires all port interfaces to their concrete adapter implementations.
 * This is the composition root of the application.
 *
 * Pattern: Manual DI (no decorator-based container) for React Native compatibility.
 */

import { Platform } from 'react-native';
import { DI_TOKENS } from './tokens';
import { ExpoLocationTelemetryAdapter } from '../adapters/outbound/telemetry/ExpoLocationTelemetryAdapter';
import { DjiTelemetryAdapter } from '../adapters/outbound/telemetry/DjiTelemetryAdapter';
import { DjiConnectionAdapter } from '../adapters/outbound/telemetry/DjiConnectionAdapter';
import { NullConnectionAdapter } from '../adapters/outbound/telemetry/NullConnectionAdapter';
import { ManageTelemetryStreamUseCase } from '../../application/use-cases/telemetry/ManageTelemetryStreamUseCase';

type Constructor<T = unknown> = new (...args: unknown[]) => T;
type Factory<T = unknown> = () => T;

class DIContainer {
  private singletons = new Map<symbol, unknown>();
  private factories = new Map<symbol, Factory>();

  registerSingleton<T>(token: symbol, instance: T): void {
    this.singletons.set(token, instance);
  }

  registerFactory<T>(token: symbol, factory: Factory<T>): void {
    this.factories.set(token, factory);
  }

  resolve<T>(token: symbol): T {
    // Check singletons first
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    // Check factories
    const factory = this.factories.get(token);
    if (factory) {
      const instance = factory() as T;
      // Cache as singleton after first resolution
      this.singletons.set(token, instance);
      return instance;
    }

    throw new Error(`No registration found for token: ${token.toString()}`);
  }

  clear(): void {
    this.singletons.clear();
    this.factories.clear();
  }
}

export const container = new DIContainer();

/**
 * Initialize the DI container with all production dependencies.
 *
 * Call this once during app startup (e.g., in App.tsx or index.ts).
 *
 * Example:
 * ```
 * import { initializeContainer } from './infrastructure/di/Container';
 * initializeContainer();
 * ```
 */
export function initializeContainer(): void {
  // --- Telemetry Providers (Outbound Ports) ---

  // GPS Provider: always available on all platforms
  container.registerFactory(DI_TOKENS.GpsTelemetryProvider, () =>
    new ExpoLocationTelemetryAdapter(),
  );

  // DJI Provider: only functional on Android with native module compiled
  container.registerFactory(DI_TOKENS.DjiTelemetryProvider, () =>
    new DjiTelemetryAdapter(),
  );

  // Connection Monitor: DJI on Android, Null on other platforms (LSP: both satisfy IConnectionMonitor)
  container.registerFactory(DI_TOKENS.ConnectionMonitor, () =>
    Platform.OS === 'android' ? new DjiConnectionAdapter() : new NullConnectionAdapter(),
  );

  // --- Use Cases ---

  container.registerFactory(DI_TOKENS.ManageTelemetryStream, () =>
    new ManageTelemetryStreamUseCase(
      container.resolve(DI_TOKENS.DjiTelemetryProvider),
      container.resolve(DI_TOKENS.GpsTelemetryProvider),
      container.resolve(DI_TOKENS.ConnectionMonitor),
      container.resolve(DI_TOKENS.TelemetryCollector),
    ),
  );

  // --- Future registrations ---
  //
  // container.registerFactory(DI_TOKENS.DroneRepository, () =>
  //   new SQLiteDroneRepository(database)
  // );
  //
  // container.registerFactory(DI_TOKENS.ValidatePreFlightLegal, () =>
  //   new ValidatePreFlightLegalUseCase(
  //     container.resolve(DI_TOKENS.DroneRepository),
  //     container.resolve(DI_TOKENS.CertificateRepository),
  //     container.resolve(DI_TOKENS.InsuranceRepository),
  //     container.resolve(DI_TOKENS.GeofenceProvider),
  //     container.resolve(DI_TOKENS.WeatherProvider),
  //   )
  // );
}

export { DI_TOKENS };
