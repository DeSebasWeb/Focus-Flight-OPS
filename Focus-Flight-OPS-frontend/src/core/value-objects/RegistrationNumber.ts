/**
 * Colombian drone registration number (matricula Aerocivil).
 * Format: HK-NNNN or similar pattern assigned by UAEAC.
 */
export class RegistrationNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): RegistrationNumber {
    const trimmed = value.trim().toUpperCase();
    if (trimmed.length === 0) {
      throw new Error('Registration number cannot be empty');
    }
    return new RegistrationNumber(trimmed);
  }

  equals(other: RegistrationNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
