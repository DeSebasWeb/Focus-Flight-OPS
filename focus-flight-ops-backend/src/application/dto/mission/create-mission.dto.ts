import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateMissionDto {
  @IsUUID()
  droneId: string;

  @IsUUID()
  purposeId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  purposeDetail?: string;

  @IsDateString()
  plannedDate: string;

  @IsNumber()
  @Min(-90) @Max(90)
  plannedLocationLat: number;

  @IsNumber()
  @Min(-180) @Max(180)
  plannedLocationLng: number;

  @IsOptional()
  @IsString()
  plannedLocationName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0) @Max(123)
  plannedAltitudeM?: number;

  @IsString()
  operationType: string; // VLOS, EVLOS, BVLOS
}

export class UpdateMissionStatusDto {
  @IsString()
  status: string;
}
