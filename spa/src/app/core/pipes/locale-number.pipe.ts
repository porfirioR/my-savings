import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({ name: 'localeNumber', standalone: true, pure: false })
export class LocaleNumberPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: number | null | undefined): string {
    if (value == null) return '';
    const locale = this.language.current() === 'en' ? 'en-US' : 'es-PY';
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  }
}
