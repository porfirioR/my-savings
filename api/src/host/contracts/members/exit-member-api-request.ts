import { IsNumber, Min } from 'class-validator';

export class ExitMemberApiRequest {
  @IsNumber() @Min(1) leftMonth: number;
  @IsNumber() @Min(2000) leftYear: number;

  constructor(partial?: Partial<ExitMemberApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
