export class FlightDuration {
  readonly totalMinutes: number;

  private constructor(totalMinutes: number) {
    this.totalMinutes = totalMinutes;
  }

  static fromMinutes(minutes: number): FlightDuration {
    if (minutes < 0) {
      throw new Error(`Flight duration cannot be negative: ${minutes} minutes`);
    }
    return new FlightDuration(minutes);
  }

  static fromTimestamps(takeoff: Date, landing: Date): FlightDuration {
    const diffMs = landing.getTime() - takeoff.getTime();
    if (diffMs < 0) {
      throw new Error('Landing time cannot be before takeoff time');
    }
    return new FlightDuration(diffMs / 60000);
  }

  get hours(): number {
    return Math.floor(this.totalMinutes / 60);
  }

  get remainingMinutes(): number {
    return Math.round(this.totalMinutes % 60);
  }

  get totalHours(): number {
    return this.totalMinutes / 60;
  }

  add(other: FlightDuration): FlightDuration {
    return new FlightDuration(this.totalMinutes + other.totalMinutes);
  }

  equals(other: FlightDuration): boolean {
    return this.totalMinutes === other.totalMinutes;
  }

  toString(): string {
    return `${this.hours}h ${this.remainingMinutes}m`;
  }
}
