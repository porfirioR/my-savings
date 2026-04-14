import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private readonly theme = inject(ThemeService);
  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.theme.init();
  }
}
