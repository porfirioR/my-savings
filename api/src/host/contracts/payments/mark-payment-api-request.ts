import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class MarkPaymentApiRequest {
  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsEnum(['member', 'cash_box'])
  paymentSource?: 'member' | 'cash_box';

  constructor(partial?: Partial<MarkPaymentApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
