import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpsertManualContributionApiRequest {
  @IsUUID() memberId: string;
  @IsUUID() contributionPeriodId: string;
  @IsNumber() @Min(0) amount: number;
  @IsOptional() @IsString() description?: string;

  constructor(partial?: Partial<UpsertManualContributionApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
