import { IsBoolean } from 'class-validator';

export class MarkLoanPaymentApiRequest {
  @IsBoolean()
  isPaid: boolean;

  constructor(partial?: Partial<MarkLoanPaymentApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
