import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateRuedaSlotApiRequest {
  @IsNumber() @Min(1) position!: number;
  @IsOptional() @IsNumber() @Min(0) previousLoanAmount?: number | null;
}
