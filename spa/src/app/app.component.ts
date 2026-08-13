import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: `
    <router-outlet />

    <div class="toast toast-bottom toast-end z-50">
      @for (t of toast.toasts(); track t.id) {
        <div class="alert" [class.alert-success]="t.type === 'success'" [class.alert-error]="t.type === 'error'">
          <span>{{ t.text | translate }}</span>
        </div>
      }
    </div>
  `,
})
export class AppComponent {
  readonly toast = inject(ToastService);
  private readonly theme = inject(ThemeService);
  private readonly language = inject(LanguageService);

  constructor() {
    this.language.init();
    this.theme.init();
  }
}
