import { IsEnum, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { RoundingUnit } from '../../../utility/enums';

export class UpdateParallelLoanApiRequest {
  @IsUUID()
  memberId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsNumber()
  @Min(0)
  interestRate: number;

  @IsNumber()
  @Min(1)
  totalInstallments: number;

  @IsOptional()
  @IsEnum(RoundingUnit)
  roundingUnit?: 0 | 500 | 1000;

  @IsNumber()
  @Min(1)
  @Max(12)
  startMonth: number;

  @IsNumber()
  @Min(2000)
  startYear: number;

  constructor(partial?: Partial<UpdateParallelLoanApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
