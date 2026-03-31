import { Controller, Get, Query, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IWeatherProvider } from '../../../../domain/ports/outbound';
import { NoaaKpIndexAdapter } from '../../outbound/external/noaa-kp-index.adapter';

@Controller('weather')
export class WeatherController {
  constructor(
    @Inject(INJECTION_TOKENS.WeatherProvider) private readonly weatherProvider: IWeatherProvider,
    private readonly kpIndexAdapter: NoaaKpIndexAdapter,
  ) {}

  @Get('current')
  async getCurrent(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.weatherProvider.getCurrentWeather(parseFloat(lat), parseFloat(lng));
  }

  @Get('forecast')
  async getForecast(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('hours') hours?: string,
  ) {
    return this.weatherProvider.getForecast(parseFloat(lat), parseFloat(lng), hours ? parseInt(hours) : 6);
  }

  @Get('kp-index')
  async getKpIndex() {
    return this.kpIndexAdapter.getCurrentKpIndex();
  }
}
