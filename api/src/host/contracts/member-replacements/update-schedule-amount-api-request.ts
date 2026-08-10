import { IsEnum, IsNumber, Min } from 'class-validator';

export class UpdateScheduleAmountApiRequest {
  @IsEnum(['outgoing', 'incoming']) side: 'outgoing' | 'incoming';
  @IsNumber() @Min(0) amount: number;

  constructor(partial?: Partial<UpdateScheduleAmountApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
