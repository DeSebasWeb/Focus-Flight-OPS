const REGISTRATION_THRESHOLD_GRAMS = 200;

export class Weight {
  readonly grams: number;

  private constructor(grams: number) {
    this.grams = grams;
  }

  static fromGrams(grams: number): Weight {
    if (grams <= 0) {
      throw new Error(`Weight must be positive: ${grams}g`);
    }
    return new Weight(grams);
  }

  static fromKilograms(kg: number): Weight {
    return Weight.fromGrams(kg * 1000);
  }

  get kilograms(): number {
    return this.grams / 1000;
  }

  requiresRegistration(): boolean {
    return this.grams >= REGISTRATION_THRESHOLD_GRAMS;
  }

  equals(other: Weight): boolean {
    return this.grams === other.grams;
  }

  toString(): string {
    return this.grams >= 1000
      ? `${this.kilograms.toFixed(2)}kg`
      : `${this.grams}g`;
  }
}
