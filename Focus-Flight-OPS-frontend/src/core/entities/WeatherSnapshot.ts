export interface WeatherSnapshotProps {
  timestamp: number;
  latitude: number;
  longitude: number;
  temperatureC: number;
  windSpeedKmh: number;
  windGustKmh?: number;
  windDirectionDeg: number;
  humidity: number;
  visibility: 'GOOD' | 'MODERATE' | 'POOR';
  visibilityKm?: number;
  kIndex?: number;
  precipitation: boolean;
  thunderstorm: boolean;
  cloudCoverPercent?: number;
}

const MAX_SAFE_WIND_KMH = 40;

export class WeatherSnapshot {
  readonly props: WeatherSnapshotProps;

  constructor(props: WeatherSnapshotProps) {
    this.props = Object.freeze({ ...props });
  }

  get isSafeForFlight(): boolean {
    return !this.hasHighWind && !this.props.thunderstorm && this.props.visibility !== 'POOR';
  }

  get hasHighWind(): boolean {
    return this.props.windSpeedKmh > MAX_SAFE_WIND_KMH;
  }

  get warnings(): string[] {
    const warnings: string[] = [];
    if (this.hasHighWind) {
      warnings.push(`Viento fuerte: ${this.props.windSpeedKmh} km/h (max: ${MAX_SAFE_WIND_KMH} km/h)`);
    }
    if (this.props.thunderstorm) {
      warnings.push('Actividad de tormentas detectada');
    }
    if (this.props.visibility === 'POOR') {
      warnings.push('Visibilidad pobre - vuelo no recomendado');
    }
    if (this.props.visibility === 'MODERATE') {
      warnings.push('Visibilidad moderada - proceder con precaucion');
    }
    if (this.props.precipitation) {
      warnings.push('Precipitacion detectada');
    }
    if (this.props.kIndex !== undefined && this.props.kIndex > 30) {
      warnings.push(`K-Index alto: ${this.props.kIndex} (riesgo de tormentas)`);
    }
    return warnings;
  }

  toJSON(): string {
    return JSON.stringify(this.props);
  }
}
