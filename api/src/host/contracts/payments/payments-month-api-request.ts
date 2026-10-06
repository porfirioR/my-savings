import { IsNumber, Max, Min } from 'class-validator';

export class PaymentsMonthApiRequest {
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2000)
  year: number;

  constructor(partial?: Partial<PaymentsMonthApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
