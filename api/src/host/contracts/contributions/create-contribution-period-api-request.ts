import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateContributionPeriodApiRequest {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @Min(0) monthlyContributionAmount: number;
  @IsInt() @Min(0) position: number;
  @IsOptional() @IsInt() @Min(0) memberCount?: number;

  constructor(partial?: Partial<CreateContributionPeriodApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
