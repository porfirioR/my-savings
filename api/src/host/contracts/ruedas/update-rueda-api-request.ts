import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRuedaApiRequest {
  @IsOptional()
  @IsNumber()
  @Min(1)
  loanAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  contributionAmount?: number;

  @IsOptional()
  @IsEnum([500, 1000])
  roundingUnit?: 500 | 1000;

  @IsOptional()
  @IsNumber()
  @Min(1)
  startMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  startYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  endMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  endYear?: number;

  @IsOptional()
  @IsEnum(['pending', 'active', 'completed'])
  status?: 'pending' | 'active' | 'completed';

  @IsOptional()
  @IsNumber()
  @Min(0)
  historicalContributionTotal?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
