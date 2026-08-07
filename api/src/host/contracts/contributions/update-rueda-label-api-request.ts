import { IsString } from 'class-validator';

export class UpdateRuedaLabelApiRequest {
  @IsString() label: string;

  constructor(partial?: Partial<UpdateRuedaLabelApiRequest>) {
    if (partial) Object.assign(this, partial);
  }
}
