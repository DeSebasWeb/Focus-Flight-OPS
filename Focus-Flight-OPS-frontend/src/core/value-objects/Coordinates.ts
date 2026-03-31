export class Coordinates {
  readonly latitude: number;
  readonly longitude: number;

  private constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static create(latitude: number, longitude: number): Coordinates {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
    }
    return new Coordinates(latitude, longitude);
  }

  distanceTo(other: Coordinates): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(other.latitude - this.latitude);
    const dLon = this.toRad(other.longitude - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  isWithinRadius(center: Coordinates, radiusMeters: number): boolean {
    return this.distanceTo(center) <= radiusMeters;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  equals(other: Coordinates): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }
}
