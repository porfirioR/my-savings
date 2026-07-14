import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateContributionPeriodApiRequest {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsNumber() @Min(0) monthlyContributionAmount?: number;
  @IsOptional() @IsInt() @Min(0) memberCount?: number;
  @IsOptional() @IsInt() @Min(0) position?: number;

  constructor(partial?: Partial<UpdateContributionPeriodApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
