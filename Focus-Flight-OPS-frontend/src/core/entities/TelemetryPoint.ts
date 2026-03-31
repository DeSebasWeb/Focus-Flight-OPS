export interface TelemetryPointProps {
  id: string;
  flightLogId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeAglM?: number;
  speedMs?: number;
  headingDeg?: number;
  batteryPercent?: number;
  signalStrength?: number;
  distanceFromPilotM?: number;
}

export class TelemetryPoint {
  readonly props: TelemetryPointProps;

  constructor(props: TelemetryPointProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isBatteryLow(): boolean {
    return this.props.batteryPercent !== undefined && this.props.batteryPercent < 20;
  }

  get isBatteryCritical(): boolean {
    return this.props.batteryPercent !== undefined && this.props.batteryPercent < 10;
  }

  get isSignalWeak(): boolean {
    return this.props.signalStrength !== undefined && this.props.signalStrength < 30;
  }
}
