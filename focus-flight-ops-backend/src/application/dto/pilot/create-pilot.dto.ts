import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DroneCategory } from '../../../domain/enums';

export class CreatePilotDto {
  @IsString()
  licenseType: string;

  @IsOptional()
  @IsString()
  uaeacPilotNumber?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}

export class UpdatePilotDto {
  @IsOptional()
  @IsString()
  licenseType?: string;

  @IsOptional()
  @IsString()
  uaeacPilotNumber?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}
