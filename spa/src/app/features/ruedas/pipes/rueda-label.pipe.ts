import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Rueda } from '../models/rueda.model';

@Pipe({ name: 'ruedaLabel', standalone: true, pure: false })
export class RuedaLabelPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(rueda: Rueda | null | undefined): string {
    if (!rueda) return '';
    if (rueda.contributionLabel) return rueda.contributionLabel;
    return `${this.translate.instant('RUEDAS.NUMBER')} ${rueda.ruedaNumber}`;
  }
}
