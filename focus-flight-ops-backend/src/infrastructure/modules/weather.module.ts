import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { OpenMeteoWeatherAdapter } from '../adapters/outbound/external/open-meteo-weather.adapter';
import { NoaaKpIndexAdapter } from '../adapters/outbound/external/noaa-kp-index.adapter';
import { WeatherController } from '../adapters/inbound/rest/weather.controller';

@Module({
  controllers: [WeatherController],
  providers: [
    { provide: INJECTION_TOKENS.WeatherProvider, useClass: OpenMeteoWeatherAdapter },
    NoaaKpIndexAdapter,
  ],
  exports: [INJECTION_TOKENS.WeatherProvider],
})
export class WeatherModule {}
