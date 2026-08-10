import { IsBoolean, IsEnum } from 'class-validator';

export class MarkScheduleApiRequest {
  @IsEnum(['outgoing', 'incoming']) side: 'outgoing' | 'incoming';
  @IsBoolean() paid: boolean;

  constructor(partial?: Partial<MarkScheduleApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
