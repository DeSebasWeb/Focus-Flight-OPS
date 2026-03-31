import { IsString, IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class StartFlightDto {
  @IsUUID()
  missionId: string;

  @IsUUID()
  droneId: string;

  @IsNumber()
  takeoffLat: number;

  @IsNumber()
  takeoffLng: number;

  @IsOptional()
  @IsNumber()
  takeoffAltitudeM?: number;

  @IsString()
  operationType: string;
}

export class EndFlightDto {
  @IsNumber()
  landingLat: number;

  @IsNumber()
  landingLng: number;

  @IsOptional()
  @IsNumber()
  maxAltitudeAglM?: number;

  @IsOptional()
  @IsNumber()
  maxDistanceM?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordTelemetryDto {
  @IsString()
  timestamp: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional() @IsNumber() altitudeAglM?: number;
  @IsOptional() @IsNumber() speedMs?: number;
  @IsOptional() @IsNumber() headingDeg?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) batteryPercent?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) signalStrength?: number;
  @IsOptional() @IsNumber() distanceFromPilotM?: number;
  @IsOptional() @IsNumber() satelliteCount?: number;
}
