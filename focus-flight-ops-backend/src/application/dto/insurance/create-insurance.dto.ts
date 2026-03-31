import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateInsuranceDto {
  @IsString()
  insurerName: string;

  @IsString()
  policyNumber: string;

  @IsOptional()
  @IsString()
  coverageType?: string;

  @IsNumber()
  @Min(0)
  coverageAmountCop: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class UpdateInsuranceDto {
  @IsOptional()
  @IsString()
  insurerName?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coverageAmountCop?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
