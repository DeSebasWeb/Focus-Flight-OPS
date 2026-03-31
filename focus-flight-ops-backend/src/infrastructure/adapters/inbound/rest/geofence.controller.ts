import { Controller, Get, Query, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IGeofenceProvider } from '../../../../domain/ports/outbound';

@Controller('geofence')
export class GeofenceController {
  constructor(
    @Inject(INJECTION_TOKENS.GeofenceProvider) private readonly geofenceProvider: IGeofenceProvider,
  ) {}

  @Get('check')
  async check(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.geofenceProvider.checkAirspace(parseFloat(lat), parseFloat(lng));
  }

  @Get('zones')
  async getZones(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    return this.geofenceProvider.getZonesInArea(
      parseFloat(lat),
      parseFloat(lng),
      radiusKm ? parseFloat(radiusKm) : 20,
    );
  }
}
