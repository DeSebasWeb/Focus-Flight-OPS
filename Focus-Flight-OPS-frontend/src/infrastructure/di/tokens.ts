/**
 * Dependency Injection Tokens
 *
 * Used to register and resolve port implementations in the DI container.
 */

export const DI_TOKENS = {
  // Repositories
  DroneRepository: Symbol.for('IDroneRepository'),
  PilotRepository: Symbol.for('IPilotRepository'),
  FlightLogRepository: Symbol.for('IFlightLogRepository'),
  ChecklistRepository: Symbol.for('IChecklistRepository'),
  CertificateRepository: Symbol.for('ICertificateRepository'),
  InsuranceRepository: Symbol.for('IInsuranceRepository'),

  // External Providers
  GeofenceProvider: Symbol.for('IGeofenceProvider'),
  WeatherProvider: Symbol.for('IWeatherProvider'),
  TelemetryCollector: Symbol.for('ITelemetryCollector'),
  LocationProvider: Symbol.for('ILocationProvider'),

  // Infrastructure
  FileStorage: Symbol.for('IFileStorage'),
  NotificationService: Symbol.for('INotificationService'),

  // Use Cases
  RegisterDrone: Symbol.for('RegisterDroneUseCase'),
  ValidatePreFlightLegal: Symbol.for('ValidatePreFlightLegalUseCase'),
  StartChecklist: Symbol.for('StartChecklistUseCase'),
  CompleteChecklistItem: Symbol.for('CompleteChecklistItemUseCase'),
  FinalizeChecklist: Symbol.for('FinalizeChecklistUseCase'),
  StartFlight: Symbol.for('StartFlightUseCase'),
  EndFlight: Symbol.for('EndFlightUseCase'),
  TriggerEmergency: Symbol.for('TriggerEmergencyUseCase'),
} as const;
