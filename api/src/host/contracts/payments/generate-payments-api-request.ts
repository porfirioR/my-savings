import { IsNumber, Min } from 'class-validator';

export class GeneratePaymentsApiRequest {
  @IsNumber()
  @Min(1)
  month: number;

  @IsNumber()
  @Min(2000)
  year: number;
}
