import { IDroneRepository, ICertificateRepository, IInsuranceRepository, IGeofenceProvider, IWeatherProvider } from '../../../core/ports/outbound';
import { PreFlightLegalResult } from '../../../core/ports/inbound';
import { Coordinates } from '../../../core/value-objects';

export class ValidatePreFlightLegalUseCase {
  constructor(
    private readonly droneRepo: IDroneRepository,
    private readonly certRepo: ICertificateRepository,
    private readonly insuranceRepo: IInsuranceRepository,
    private readonly geofenceProvider: IGeofenceProvider,
    private readonly weatherProvider: IWeatherProvider,
  ) {}

  async execute(pilotId: string, droneId: string, latitude: number, longitude: number): Promise<PreFlightLegalResult> {
    const blockingReasons: string[] = [];
    const documentErrors: string[] = [];

    // 1. Document validation
    const drone = await this.droneRepo.findById(droneId);
    const droneRegistered = drone ? (!drone.requiresRegistration || drone.isRegistered) : false;
    if (!droneRegistered) {
      documentErrors.push('Drone >=200g requiere matricula Aerocivil');
    }

    const certificates = await this.certRepo.findValidByPilotId(pilotId);
    const certificateValid = certificates.some((cert) => cert.isCurrentlyValid);
    if (!certificateValid) {
      documentErrors.push('Certificado de piloto UAEAC no valido o vencido');
    }

    const insurance = await this.insuranceRepo.findActiveByPilotId(pilotId);
    const insuranceActive = insurance?.isCurrentlyActive ?? false;
    if (!insuranceActive) {
      documentErrors.push('Poliza RC extracontractual no vigente');
    }

    if (documentErrors.length > 0) {
      blockingReasons.push(...documentErrors);
    }

    // 2. Airspace check
    const position = Coordinates.create(latitude, longitude);
    const airspaceCheck = await this.geofenceProvider.checkAirspace(position);
    if (airspaceCheck.isRestricted) {
      blockingReasons.push(
        ...airspaceCheck.restrictedZones.map(
          (zone) => `Zona restringida: ${zone.props.name} (${zone.props.type})`,
        ),
      );
    }

    // 3. Weather check
    const weatherSnapshot = await this.weatherProvider.getCurrentWeather(latitude, longitude);
    const weatherWarnings = weatherSnapshot.warnings;

    const isApproved = blockingReasons.length === 0;

    return {
      isApproved,
      documentCheck: {
        droneRegistered,
        certificateValid,
        insuranceActive,
        errors: documentErrors,
      },
      airspaceCheck,
      weatherCheck: {
        snapshot: weatherSnapshot,
        isSafe: weatherSnapshot.isSafeForFlight,
        warnings: weatherWarnings,
      },
      blockingReasons,
    };
  }
}
