import { IsString, IsOptional, IsInt, IsUUID, Min } from 'class-validator';

export class CreateDroneDto {
  @IsUUID()
  modelId: string;

  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsInt()
  @Min(1)
  mtowGrams: number;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class UpdateDroneDto {
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
