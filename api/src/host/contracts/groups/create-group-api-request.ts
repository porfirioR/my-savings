import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateGroupApiRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  startMonth: number;

  @IsNumber()
  @Min(2000)
  startYear: number;

  constructor(partial?: Partial<CreateGroupApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
