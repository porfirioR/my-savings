import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateMemberApiRequest {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(15) position?: number;
  @IsOptional() @IsNumber() @Min(1) joinedMonth?: number;
  @IsOptional() @IsNumber() @Min(2000) joinedYear?: number;

  constructor(partial?: Partial<UpdateMemberApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
