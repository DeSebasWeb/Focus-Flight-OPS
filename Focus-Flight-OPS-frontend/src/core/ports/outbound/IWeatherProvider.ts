import { WeatherSnapshot } from '../../entities';

export interface IWeatherProvider {
  getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot>;
  getForecast(latitude: number, longitude: number, hoursAhead?: number): Promise<WeatherSnapshot[]>;
}
