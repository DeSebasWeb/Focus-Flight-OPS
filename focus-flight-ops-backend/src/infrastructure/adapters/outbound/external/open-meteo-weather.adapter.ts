import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IWeatherProvider, WeatherData } from '../../../../domain/ports/outbound';

@Injectable()
export class OpenMeteoWeatherAdapter implements IWeatherProvider {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get('OPEN_METEO_BASE_URL', 'https://api.open-meteo.com/v1');
  }

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: {
        latitude: lat,
        longitude: lng,
        current: [
          'temperature_2m',
          'wind_speed_10m',
          'wind_gusts_10m',
          'wind_direction_10m',
          'relative_humidity_2m',
          'precipitation',
          'cloud_cover',
          'surface_pressure',
          'weather_code',
        ].join(','),
        timezone: 'America/Bogota',
      },
    });

    const current = response.data.current;
    const weatherCode = current.weather_code;

    return {
      temperatureC: current.temperature_2m,
      windSpeedKmh: current.wind_speed_10m,
      windGustKmh: current.wind_gusts_10m,
      windDirectionDeg: current.wind_direction_10m,
      humidityPercent: current.relative_humidity_2m,
      visibility: this.getVisibility(weatherCode),
      visibilityKm: this.getVisibilityKm(weatherCode),
      kIndex: null,
      precipitation: current.precipitation > 0,
      thunderstorm: weatherCode >= 95,
      cloudCoverPercent: current.cloud_cover,
      pressureHpa: current.surface_pressure,
    };
  }

  async getForecast(lat: number, lng: number, hoursAhead = 6): Promise<WeatherData[]> {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: [
          'temperature_2m',
          'wind_speed_10m',
          'wind_gusts_10m',
          'wind_direction_10m',
          'relative_humidity_2m',
          'precipitation_probability',
          'cloud_cover',
          'surface_pressure',
          'weather_code',
        ].join(','),
        forecast_hours: hoursAhead,
        timezone: 'America/Bogota',
      },
    });

    const hourly = response.data.hourly;
    const result: WeatherData[] = [];

    for (let i = 0; i < Math.min(hoursAhead, hourly.time.length); i++) {
      const code = hourly.weather_code[i];
      result.push({
        temperatureC: hourly.temperature_2m[i],
        windSpeedKmh: hourly.wind_speed_10m[i],
        windGustKmh: hourly.wind_gusts_10m[i],
        windDirectionDeg: hourly.wind_direction_10m[i],
        humidityPercent: hourly.relative_humidity_2m[i],
        visibility: this.getVisibility(code),
        visibilityKm: this.getVisibilityKm(code),
        kIndex: null,
        precipitation: hourly.precipitation_probability[i] > 50,
        thunderstorm: code >= 95,
        cloudCoverPercent: hourly.cloud_cover[i],
        pressureHpa: hourly.surface_pressure[i],
      });
    }

    return result;
  }

  private getVisibility(weatherCode: number): string {
    if (weatherCode >= 40 && weatherCode <= 49) return 'POOR'; // Fog
    if (weatherCode >= 50 && weatherCode <= 69) return 'MODERATE'; // Drizzle/Rain
    if (weatherCode >= 70 && weatherCode <= 79) return 'POOR'; // Snow
    if (weatherCode >= 80 && weatherCode <= 99) return 'MODERATE'; // Showers/thunderstorm
    return 'GOOD';
  }

  private getVisibilityKm(weatherCode: number): number {
    if (weatherCode >= 40 && weatherCode <= 49) return 1;
    if (weatherCode >= 50 && weatherCode <= 69) return 5;
    if (weatherCode >= 70 && weatherCode <= 79) return 2;
    if (weatherCode >= 80 && weatherCode <= 99) return 4;
    return 10;
  }
}
