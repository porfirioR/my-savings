import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { RoundingUnit } from '../../../utility/enums';

export class UpdateRuedaApiRequest {
  @IsOptional() @IsEnum(['new', 'continua']) type?: 'new' | 'continua';
  @IsOptional() @IsNumber() @Min(1) loanAmount?: number;
  @IsOptional() @IsNumber() @Min(0) interestRate?: number;
  @IsOptional() @IsNumber() @Min(0) contributionAmount?: number;
  @IsOptional() @IsEnum(RoundingUnit) roundingUnit?: 0 | 500 | 1000;
  @IsOptional() @IsNumber() @Min(1) startMonth?: number;
  @IsOptional() @IsNumber() @Min(2000) startYear?: number;
  @IsOptional() @IsNumber() @Min(1) endMonth?: number;
  @IsOptional() @IsNumber() @Min(2000) endYear?: number;
  @IsOptional() @IsEnum(['pending', 'active', 'completed']) status?: 'pending' | 'active' | 'completed';
  @IsOptional() @IsNumber() @Min(0) historicalContributionTotal?: number;
  @IsOptional() @IsUUID() previousRuedaId?: string;
  @IsOptional() @IsEnum(['constant', 'variable']) slotAmountMode?: 'constant' | 'variable';
  @IsOptional() @IsString() notes?: string;

  constructor(partial?: Partial<UpdateRuedaApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
