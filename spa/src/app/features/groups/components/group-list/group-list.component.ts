import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../models/group.model';
import { CreateGroupDialogComponent } from '../create-group-dialog/create-group-dialog.component';
import { DeleteGroupDialogComponent } from '../delete-group-dialog/delete-group-dialog.component';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [RouterLink, TranslateModule, CreateGroupDialogComponent, DeleteGroupDialogComponent],
  template: `
    <div class="min-h-screen bg-base-100">
      <div class="max-w-2xl mx-auto px-6 py-10">
        <!-- Header -->
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-2xl font-bold tracking-tight">{{ 'GROUPS.TITLE' | translate }}</h1>
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm btn-circle" (click)="theme.toggle()" [title]="theme.isDark() ? 'Modo claro' : 'Modo oscuro'">
              @if (theme.isDark()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M5.64 18.36l-.71.71m12.02 0-.71-.71M5.64 5.64l-.71-.71M12 5a7 7 0 100 14A7 7 0 0012 5z"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
                </svg>
              }
            </button>
            <button class="btn btn-primary btn-sm" (click)="showCreateDialog.set(true)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              {{ 'GROUPS.NEW' | translate }}
            </button>
          </div>
        </div>
        <div class="divider mt-0 mb-6"></div>

        <!-- Loading -->
        @if (service.loading()) {
          <div class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        }

        <!-- List -->
        @if (!service.loading()) {
          @if (service.groups().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="text-base-content/50 text-sm">{{ 'GROUPS.EMPTY' | translate }}</p>
            </div>
          } @else {
            <div class="grid gap-3">
              @for (group of service.groups(); track group.id) {
                <div class="card bg-base-200 border border-base-300 hover:border-primary/30 hover:shadow-md transition-all">
                  <div class="card-body p-4">
                    <div class="flex items-center justify-between gap-2">
                      <a [routerLink]="['/groups', group.id]" class="flex-1 min-w-0 cursor-pointer">
                        <h2 class="font-semibold text-base truncate">{{ group.name }}</h2>
                        <p class="text-xs text-base-content/50 mt-0.5">
                          {{ 'GROUPS.START_DATE' | translate }}: {{ 'MONTHS.' + group.startMonth | translate }} {{ group.startYear }}
                          &bull; {{ group.totalRuedas }} {{ 'GROUPS.TOTAL_RUEDAS' | translate }}
                        </p>
                      </a>
                      <div class="flex items-center gap-1 shrink-0">
                        <button class="btn btn-ghost btn-xs btn-circle text-error"
                          [title]="'APP.DELETE' | translate"
                          (click)="openDeleteDialog(group)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                        <a [routerLink]="['/groups', group.id]" class="btn btn-ghost btn-xs btn-circle">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>

    <app-create-group-dialog
      [show]="showCreateDialog()"
      (closed)="showCreateDialog.set(false)"
      (saved)="showCreateDialog.set(false)" />

    <app-delete-group-dialog
      [show]="!!deletingGroup()"
      [group]="deletingGroup()"
      (closed)="deletingGroup.set(null)"
      (deleted)="deletingGroup.set(null)" />
  `,
})
export class GroupListComponent implements OnInit {
  readonly service = inject(GroupsService);
  readonly theme = inject(ThemeService);
  showCreateDialog = signal(false);
  deletingGroup = signal<Group | null>(null);

  ngOnInit(): void {
    this.service.loadAll();
  }

  openDeleteDialog(group: Group): void {
    this.deletingGroup.set(group);
  }
}
