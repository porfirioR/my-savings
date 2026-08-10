import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMemberReplacementApiRequest {
  @IsUUID() outgoingMemberId: string;
  @IsNumber() @Min(1) leftMonth: number;
  @IsNumber() @Min(2000) leftYear: number;
  @IsNumber() @Min(0) accumulatedContributions: number;
  @IsNumber() @Min(0) remainingLoanBalance: number;
  @IsString() @IsNotEmpty() incomingFirstName: string;
  @IsString() @IsNotEmpty() incomingLastName: string;
  @IsOptional() @IsString() incomingPhone?: string;
  @IsNumber() @Min(0) outgoingMonthlyAmount: number;
  @IsNumber() @Min(0) incomingTotalAmount: number;
  @IsNumber() @Min(1) incomingInstallments: number;

  constructor(partial?: Partial<CreateMemberReplacementApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
