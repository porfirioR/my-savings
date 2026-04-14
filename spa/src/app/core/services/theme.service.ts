import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';
const LIGHT_THEME = 'nord';
const DARK_THEME = 'forest';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(false);

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = saved ? saved === DARK_THEME : prefersDark;
    this.apply(useDark);
  }

  toggle(): void {
    this.apply(!this.isDark());
  }

  private apply(dark: boolean): void {
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? DARK_THEME : LIGHT_THEME);
    localStorage.setItem(STORAGE_KEY, dark ? DARK_THEME : LIGHT_THEME);
  }
}