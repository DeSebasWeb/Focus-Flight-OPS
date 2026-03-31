/**
 * Dependency Injection Container
 *
 * Wires all port interfaces to their concrete adapter implementations.
 * This is the composition root of the application.
 *
 * Pattern: Manual DI (no decorator-based container) for React Native compatibility.
 */

import { DI_TOKENS } from './tokens';

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
  // Repository registrations would go here:
  //
  // container.registerFactory(DI_TOKENS.DroneRepository, () =>
  //   new SQLiteDroneRepository(database)
  // );
  //
  // container.registerFactory(DI_TOKENS.WeatherProvider, () =>
  //   new OpenMeteoWeatherAdapter()
  // );
  //
  // Use case registrations:
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
