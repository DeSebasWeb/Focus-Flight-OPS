export abstract class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

export class AltitudeExceededError extends DomainError {
  constructor(currentM: number, maxM: number = 123) {
    super('ALTITUDE_EXCEEDED', `Altitud ${currentM}m excede el limite regulatorio de ${maxM}m AGL`);
  }
}

export class RangeExceededError extends DomainError {
  constructor(currentM: number, maxM: number = 500) {
    super('RANGE_EXCEEDED', `Distancia ${currentM}m excede el limite VLOS de ${maxM}m`);
  }
}

export class RestrictedAirspaceError extends DomainError {
  constructor(zoneName: string, zoneType: string) {
    super('RESTRICTED_AIRSPACE', `Operacion prohibida en zona restringida: ${zoneName} (${zoneType})`);
  }
}

export class ExpiredCertificateError extends DomainError {
  constructor(certificateType: string, expiryDate: string) {
    super('EXPIRED_CERTIFICATE', `Certificado ${certificateType} vencido desde ${expiryDate}`);
  }
}

export class ExpiredInsuranceError extends DomainError {
  constructor(policyNumber: string, expiryDate: string) {
    super('EXPIRED_INSURANCE', `Poliza ${policyNumber} vencida desde ${expiryDate}`);
  }
}

export class ChecklistIncompleteError extends DomainError {
  constructor(checklistType: string, missingCount: number) {
    super('CHECKLIST_INCOMPLETE', `Checklist ${checklistType}: ${missingCount} item(s) critico(s) sin completar`);
  }
}

export class DroneNotRegisteredError extends DomainError {
  constructor(droneModel: string) {
    super('DRONE_NOT_REGISTERED', `Drone ${droneModel} (>=200g) requiere matricula Aerocivil`);
  }
}

export class MissingInsuranceError extends DomainError {
  constructor() {
    super('MISSING_INSURANCE', 'Se requiere poliza de responsabilidad civil extracontractual vigente');
  }
}
