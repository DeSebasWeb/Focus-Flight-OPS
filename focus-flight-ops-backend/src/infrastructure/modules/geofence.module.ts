import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';
import { UaeacArcGisGeofenceAdapter } from '../adapters/outbound/external/uaeac-arcgis-geofence.adapter';
import { GeofenceController } from '../adapters/inbound/rest/geofence.controller';

@Module({
  imports: [AuthModule],
  controllers: [GeofenceController],
  providers: [
    { provide: INJECTION_TOKENS.GeofenceProvider, useClass: UaeacArcGisGeofenceAdapter },
  ],
  exports: [INJECTION_TOKENS.GeofenceProvider],
})
export class GeofenceModule {}
