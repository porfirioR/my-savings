import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';

interface Group {
  id: string;
  name: string;
  startMonth: number;
  startYear: number;
  totalRuedas: number;
}

@Component({
  selector: 'app-group-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <div class="drawer lg:drawer-open min-h-screen">
      <input id="sidebar-toggle" type="checkbox" class="drawer-toggle" />

      <!-- Page content -->
      <div class="drawer-content flex flex-col">
        <!-- Top navbar (mobile) -->
        <div class="navbar bg-base-200 border-b border-base-300 lg:hidden">
          <label for="sidebar-toggle" class="btn btn-ghost btn-sm drawer-button mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </label>
          <span class="font-semibold text-base truncate">{{ group()?.name }}</span>
        </div>

        <!-- Main content -->
        <main class="flex-1 p-4 lg:p-8 bg-base-100">
          <router-outlet />
        </main>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-10">
        <label for="sidebar-toggle" class="drawer-overlay"></label>
        <aside class="bg-base-200 w-64 min-h-full flex flex-col border-r border-base-300">
          <!-- Back link + Group header -->
          <div class="p-4 border-b border-base-300">
            <a routerLink="/groups" class="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content transition-colors mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              {{ 'NAV.GROUPS' | translate }}
            </a>
            <h2 class="font-bold text-lg leading-tight truncate">{{ group()?.name ?? '...' }}</h2>
            @if (group()) {
              <p class="text-xs text-base-content/50 mt-0.5">
                Rueda {{ group()!.totalRuedas }}
              </p>
            }
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-3">
            <ul class="flex flex-col gap-0.5">
              <li>
                <a [routerLink]="['rueda']"
                   routerLinkActive="bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-base-300 text-base-content/70 hover:text-base-content">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  {{ 'NAV.RUEDA' | translate }}
                </a>
              </li>
              <li>
                <a [routerLink]="['ruedas']"
                   routerLinkActive="bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-base-300 text-base-content/70 hover:text-base-content">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  {{ 'NAV.RUEDAS' | translate }}
                </a>
              </li>
              <li>
                <a [routerLink]="['members']"
                   routerLinkActive="bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-base-300 text-base-content/70 hover:text-base-content">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                  </svg>
                  {{ 'NAV.MEMBERS' | translate }}
                </a>
              </li>
              <li>
                <a [routerLink]="['parallel-loans']"
                   routerLinkActive="bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-base-300 text-base-content/70 hover:text-base-content">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ 'NAV.PARALLEL_LOANS' | translate }}
                </a>
              </li>
              <li>
                <a [routerLink]="['cash-box']"
                   routerLinkActive="bg-primary/10 text-primary font-semibold"
                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-base-300 text-base-content/70 hover:text-base-content">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  {{ 'NAV.CASH_BOX' | translate }}
                </a>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  `,
})
export class GroupShellComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  group = signal<Group | null>(null);

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('groupId')!;
    this.api.get<Group>(`groups/${groupId}`).subscribe(g => this.group.set(g));
  }
}
