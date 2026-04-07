import { Coordinates } from './Coordinates';
import { TelemetryPoint } from '../entities';

export interface TelemetryReadingProps {
  readonly timestamp: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly altitudeAglM: number;
  readonly speedMs: number;
  readonly headingDeg: number;
  readonly batteryPercent: number;
  readonly signalStrength: number;
  readonly satelliteCount: number;
  readonly distanceFromPilotM: number;
}

export class TelemetryReading {
  readonly timestamp: number;
  readonly position: Coordinates;
  readonly altitudeAglM: number;
  readonly speedMs: number;
  readonly headingDeg: number;
  readonly batteryPercent: number;
  readonly signalStrength: number;
  readonly satelliteCount: number;
  readonly distanceFromPilotM: number;

  private constructor(props: TelemetryReadingProps) {
    this.timestamp = props.timestamp;
    this.position = Coordinates.create(props.latitude, props.longitude);
    this.altitudeAglM = props.altitudeAglM;
    this.speedMs = props.speedMs;
    this.headingDeg = props.headingDeg;
    this.batteryPercent = props.batteryPercent;
    this.signalStrength = props.signalStrength;
    this.satelliteCount = props.satelliteCount;
    this.distanceFromPilotM = props.distanceFromPilotM;
    Object.freeze(this);
  }

  static create(props: TelemetryReadingProps): TelemetryReading {
    if (props.timestamp <= 0) {
      throw new Error(`Invalid timestamp: ${props.timestamp}. Must be positive.`);
    }
    if (props.altitudeAglM < 0) {
      throw new Error(`Invalid altitude AGL: ${props.altitudeAglM}. Must be >= 0.`);
    }
    if (props.speedMs < 0) {
      throw new Error(`Invalid speed: ${props.speedMs}. Must be >= 0.`);
    }
    if (props.headingDeg < 0 || props.headingDeg > 360) {
      throw new Error(`Invalid heading: ${props.headingDeg}. Must be between 0 and 360.`);
    }
    if (props.batteryPercent < 0 || props.batteryPercent > 100) {
      throw new Error(`Invalid battery percent: ${props.batteryPercent}. Must be between 0 and 100.`);
    }
    if (props.signalStrength < 0 || props.signalStrength > 100) {
      throw new Error(`Invalid signal strength: ${props.signalStrength}. Must be between 0 and 100.`);
    }
    if (props.satelliteCount < 0) {
      throw new Error(`Invalid satellite count: ${props.satelliteCount}. Must be >= 0.`);
    }
    if (props.distanceFromPilotM < 0) {
      throw new Error(`Invalid distance from pilot: ${props.distanceFromPilotM}. Must be >= 0.`);
    }
    return new TelemetryReading(props);
  }

  get isBatteryLow(): boolean {
    return this.batteryPercent < 20;
  }

  get isBatteryCritical(): boolean {
    return this.batteryPercent < 10;
  }

  get isSignalWeak(): boolean {
    return this.signalStrength < 30;
  }

  get exceedsRegulatoryAltitude(): boolean {
    return this.altitudeAglM > 123;
  }

  toTelemetryPoint(id: string, flightLogId: string): TelemetryPoint {
    return new TelemetryPoint({
      id,
      flightLogId,
      timestamp: this.timestamp,
      latitude: this.position.latitude,
      longitude: this.position.longitude,
      altitudeAglM: this.altitudeAglM,
      speedMs: this.speedMs,
      headingDeg: this.headingDeg,
      batteryPercent: this.batteryPercent,
      signalStrength: this.signalStrength,
      distanceFromPilotM: this.distanceFromPilotM,
    });
  }

  equals(other: TelemetryReading): boolean {
    return (
      this.timestamp === other.timestamp &&
      this.position.equals(other.position) &&
      this.altitudeAglM === other.altitudeAglM
    );
  }
}
