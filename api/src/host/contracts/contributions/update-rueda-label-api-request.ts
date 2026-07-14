import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRuedaLabelApiRequest {
  @IsString() @IsNotEmpty() label: string;

  constructor(partial?: Partial<UpdateRuedaLabelApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
