const MAX_VLOS_DISTANCE_METERS = 500;

export class Distance {
  readonly meters: number;

  private constructor(meters: number) {
    this.meters = meters;
  }

  static create(meters: number): Distance {
    if (meters < 0) {
      throw new Error(`Distance cannot be negative: ${meters}m`);
    }
    return new Distance(meters);
  }

  exceedsVLOS(): boolean {
    return this.meters > MAX_VLOS_DISTANCE_METERS;
  }

  static get maxVLOS(): Distance {
    return new Distance(MAX_VLOS_DISTANCE_METERS);
  }

  get kilometers(): number {
    return this.meters / 1000;
  }

  equals(other: Distance): boolean {
    return this.meters === other.meters;
  }

  toString(): string {
    return this.meters >= 1000
      ? `${this.kilometers.toFixed(1)}km`
      : `${this.meters}m`;
  }
}
