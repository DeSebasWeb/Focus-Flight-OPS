import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './infrastructure/modules/auth.module';
import { FleetModule } from './infrastructure/modules/fleet.module';
import { CertificateModule } from './infrastructure/modules/certificate.module';
import { InsuranceModule } from './infrastructure/modules/insurance.module';
import { MissionModule } from './infrastructure/modules/mission.module';
import { FlightLogModule } from './infrastructure/modules/flight-log.module';
import { ChecklistModule } from './infrastructure/modules/checklist.module';
import { WeatherModule } from './infrastructure/modules/weather.module';
import { GeofenceModule } from './infrastructure/modules/geofence.module';
import { EmergencyModule } from './infrastructure/modules/emergency.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    FleetModule,
    CertificateModule,
    InsuranceModule,
    MissionModule,
    FlightLogModule,
    ChecklistModule,
    WeatherModule,
    GeofenceModule,
    EmergencyModule,
  ],
})
export class AppModule {}
