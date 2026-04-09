import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { GroupsService } from '../../services/groups.service';
import { CreateGroupRequest } from '../../models/group.model';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [RouterLink, TranslateModule, FormsModule],
  template: `
    <div class="min-h-screen bg-base-100">
      <div class="max-w-2xl mx-auto px-6 py-10">
        <!-- Header -->
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-2xl font-bold tracking-tight">{{ 'GROUPS.TITLE' | translate }}</h1>
          <button class="btn btn-primary btn-sm" onclick="group_modal.showModal()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ 'GROUPS.NEW' | translate }}
          </button>
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
                <a [routerLink]="['/groups', group.id]"
                   class="card bg-base-200 border border-base-300 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <div class="card-body p-4">
                    <div class="flex items-center justify-between">
                      <div class="min-w-0">
                        <h2 class="font-semibold text-base truncate">{{ group.name }}</h2>
                        <p class="text-xs text-base-content/50 mt-0.5">
                          Inicio: {{ group.startMonth }}/{{ group.startYear }}
                          &bull; {{ group.totalRuedas }} rueda(s)
                        </p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/30 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </a>
              }
            </div>
          }
        }
      </div>
    </div>

    <!-- New Group Modal -->
    <dialog id="group_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-1">{{ 'GROUPS.NEW' | translate }}</h3>
        <p class="text-sm text-base-content/50 mb-4">Completa los datos del nuevo grupo de ahorro.</p>
        <form #groupForm="ngForm">
          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">{{ 'GROUPS.NAME' | translate }} <span class="text-error">*</span></legend>
            <input type="text" class="input input-bordered w-full" name="name"
              [(ngModel)]="form.name" required #name="ngModel"
              [class.input-error]="name.invalid && name.touched" />
            @if (name.invalid && name.touched) {
              <span class="text-error text-xs mt-1">Campo requerido</span>
            }
          </fieldset>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Mes inicio <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="startMonth"
                [(ngModel)]="form.startMonth" required min="1" max="12" #startMonth="ngModel"
                [class.input-error]="startMonth.invalid && startMonth.touched" />
              @if (startMonth.invalid && startMonth.touched) {
                <span class="text-error text-xs mt-1">Valor entre 1 y 12</span>
              }
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Año inicio <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="startYear"
                [(ngModel)]="form.startYear" required min="2000" #startYear="ngModel"
                [class.input-error]="startYear.invalid && startYear.touched" />
              @if (startYear.invalid && startYear.touched) {
                <span class="text-error text-xs mt-1">Año inválido</span>
              }
            </fieldset>
          </div>
        </form>
        <div class="divider my-2"></div>
        <div class="modal-action mt-0">
          <form method="dialog">
            <button class="btn btn-ghost">{{ 'APP.CANCEL' | translate }}</button>
          </form>
          <button class="btn btn-primary" (click)="create()" [disabled]="groupForm.invalid || saving()">
            @if (saving()) { <span class="loading loading-spinner loading-sm"></span> }
            {{ 'APP.SAVE' | translate }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  `,
})
export class GroupListComponent implements OnInit {
  readonly service = inject(GroupsService);
  saving = signal(false);
  form: CreateGroupRequest = { name: '', startMonth: 1, startYear: new Date().getFullYear() };

  ngOnInit(): void {
    this.service.loadAll();
  }

  create(): void {
    if (!this.form.name.trim()) return;
    this.saving.set(true);
    this.service.create(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.form = { name: '', startMonth: 1, startYear: new Date().getFullYear() };
        (document.getElementById('group_modal') as HTMLDialogElement)?.close();
      },
      error: () => this.saving.set(false),
    });
  }
}
