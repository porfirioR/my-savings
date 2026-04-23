import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateMemberApiRequest {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsNumber() @Min(1) @Max(15) position: number;
  @IsNumber() @Min(1) joinedMonth: number;
  @IsNumber() @Min(2000) joinedYear: number;

  constructor(partial?: Partial<CreateMemberApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
