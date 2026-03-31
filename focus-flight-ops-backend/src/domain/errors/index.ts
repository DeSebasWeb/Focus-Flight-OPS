export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundError extends DomainError {
  readonly code = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, id: string) {
    super(`${entityName} with id "${id}" was not found`);
  }
}

export class AltitudeExceededError extends DomainError {
  readonly code = 'ALTITUDE_EXCEEDED';

  constructor(currentM: number, maxM: number = 123) {
    super(
      `Altitude ${currentM}m exceeds maximum allowed ${maxM}m AGL`,
    );
  }
}

export class RangeExceededError extends DomainError {
  readonly code = 'RANGE_EXCEEDED';

  constructor(currentM: number, maxM: number = 500) {
    super(
      `Range ${currentM}m exceeds maximum allowed ${maxM}m from pilot`,
    );
  }
}

export class RestrictedAirspaceError extends DomainError {
  readonly code = 'RESTRICTED_AIRSPACE';

  constructor(zoneName: string, zoneType: string) {
    super(
      `Operation in restricted airspace: "${zoneName}" (type: ${zoneType})`,
    );
  }
}

export class ExpiredCertificateError extends DomainError {
  readonly code = 'EXPIRED_CERTIFICATE';

  constructor(certificateType: string, expiryDate: Date) {
    super(
      `Certificate "${certificateType}" expired on ${expiryDate.toISOString().split('T')[0]}`,
    );
  }
}

export class ExpiredInsuranceError extends DomainError {
  readonly code = 'EXPIRED_INSURANCE';

  constructor(policyNumber: string, expiryDate: Date) {
    super(
      `Insurance policy "${policyNumber}" expired on ${expiryDate.toISOString().split('T')[0]}`,
    );
  }
}

export class ChecklistIncompleteError extends DomainError {
  readonly code = 'CHECKLIST_INCOMPLETE';

  constructor(checklistType: string, missingCount: number) {
    super(
      `Checklist "${checklistType}" has ${missingCount} unchecked item(s)`,
    );
  }
}

export class DroneNotRegisteredError extends DomainError {
  readonly code = 'DRONE_NOT_REGISTERED';

  constructor(droneModel: string) {
    super(`Drone model "${droneModel}" is not registered with UAEAC`);
  }
}

export class MissingInsuranceError extends DomainError {
  readonly code = 'MISSING_INSURANCE';

  constructor() {
    super('No active insurance policy found for pilot');
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password');
  }
}

export class DuplicateEmailError extends DomainError {
  readonly code = 'DUPLICATE_EMAIL';

  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
  }
}

export class DuplicateDocumentError extends DomainError {
  readonly code = 'DUPLICATE_DOCUMENT';

  constructor(documentNumber: string) {
    super(
      `A user with document number "${documentNumber}" already exists`,
    );
  }
}

export class TokenExpiredError extends DomainError {
  readonly code = 'TOKEN_EXPIRED';

  constructor() {
    super('Token has expired');
  }
}

export class UnauthorizedAccessError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor() {
    super('No tiene permisos para esta operacion');
  }
}
