import { IsEnum, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateParallelLoanApiRequest {
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

  @IsEnum([500, 1000])
  roundingUnit: 500 | 1000;

  @IsNumber()
  @Min(1)
  @Max(12)
  startMonth: number;

  @IsNumber()
  @Min(2000)
  startYear: number;

  constructor(partial?: Partial<CreateParallelLoanApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
