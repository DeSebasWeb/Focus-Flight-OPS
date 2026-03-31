import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  type: string; // COMPETENCY, MEDICAL, TRAINING

  @IsString()
  certificateNumber: string;

  @IsString()
  issuingAuthority: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
