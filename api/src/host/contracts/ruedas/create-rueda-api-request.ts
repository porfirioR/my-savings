import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoundingUnit } from '../../../utility/enums';

export class CreateRuedaSlotApiRequest {
  @IsUUID()
  memberId: string;

  @IsNumber()
  @Min(1)
  @Max(15)
  position: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  loanAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  previousLoanAmount?: number;
}

export class CreateRuedaApiRequest {
  @IsEnum(['new', 'continua'])
  type: 'new' | 'continua';

  @IsNumber()
  @Min(1)
  loanAmount: number;

  @IsNumber()
  @Min(0)
  interestRate: number;

  @IsNumber()
  @Min(1)
  contributionAmount: number;

  @IsEnum(RoundingUnit)
  roundingUnit: 0 | 500 | 1000;

  @IsNumber()
  @Min(1)
  startMonth: number;

  @IsNumber()
  @Min(2000)
  startYear: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  historicalContributionTotal?: number;

  @IsOptional()
  @IsUUID()
  previousRuedaId?: string;

  @IsEnum(['constant', 'variable'])
  slotAmountMode: 'constant' | 'variable';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRuedaSlotApiRequest)
  slots: CreateRuedaSlotApiRequest[];
}
