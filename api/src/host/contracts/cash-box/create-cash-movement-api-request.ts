import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCashMovementApiRequest {
  @IsEnum(['in', 'out'])
  movementType: 'in' | 'out';

  @IsEnum(['automatic', 'manual'])
  sourceType: 'automatic' | 'manual';

  @IsString()
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

  constructor(partial?: Partial<CreateCashMovementApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
