import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'es';

const STORAGE_KEY = 'lang';
const DEFAULT_LANG: AppLanguage = 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  current = signal<AppLanguage>(DEFAULT_LANG);

  init(): void {
    this.translate.setDefaultLang(DEFAULT_LANG);
    const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
    this.apply(saved === 'es' ? 'es' : DEFAULT_LANG);
  }

  toggle(): void {
    this.apply(this.current() === 'en' ? 'es' : 'en');
  }

  private apply(lang: AppLanguage): void {
    this.current.set(lang);
    this.translate.use(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
