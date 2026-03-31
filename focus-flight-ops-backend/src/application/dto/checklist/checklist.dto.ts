import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class StartChecklistDto {
  @IsUUID()
  missionId: string;

  @IsString()
  templateType: string; // PRE_ASSEMBLY, CONFIGURATION, PRE_TAKEOFF, POST_FLIGHT
}

export class CheckItemDto {
  @IsBoolean()
  isChecked: boolean;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
