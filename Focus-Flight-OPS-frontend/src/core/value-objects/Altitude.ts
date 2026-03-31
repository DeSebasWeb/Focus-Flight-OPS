const MAX_ALTITUDE_AGL_METERS = 123;

export class Altitude {
  readonly meters: number;

  private constructor(meters: number) {
    this.meters = meters;
  }

  static create(meters: number): Altitude {
    if (meters < 0) {
      throw new Error(`Altitude cannot be negative: ${meters}m`);
    }
    return new Altitude(meters);
  }

  exceedsRegulatory(): boolean {
    return this.meters > MAX_ALTITUDE_AGL_METERS;
  }

  get feet(): number {
    return this.meters * 3.28084;
  }

  static get maxAllowed(): Altitude {
    return new Altitude(MAX_ALTITUDE_AGL_METERS);
  }

  equals(other: Altitude): boolean {
    return this.meters === other.meters;
  }

  toString(): string {
    return `${this.meters}m AGL`;
  }
}
