import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateGroupApiRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  startMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  startYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalRuedas?: number;
}
