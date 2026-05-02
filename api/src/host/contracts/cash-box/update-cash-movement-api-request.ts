import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCashMovementApiRequest {
  @IsEnum(['in', 'out'])
  type: 'in' | 'out';

  @IsEnum(['rueda_disbursement', 'rueda_collection', 'contribution', 'parallel_loan_disbursement', 'parallel_loan_payment', 'member_entry', 'member_exit', 'adjustment'])
  category: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsNumber()
  @Min(1)
  month: number;

  @IsNumber()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsString()
  description?: string;

  constructor(partial?: Partial<UpdateCashMovementApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
