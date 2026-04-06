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
    <div class="min-h-screen bg-base-100 p-6">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">{{ 'GROUPS.TITLE' | translate }}</h1>
          <button class="btn btn-primary" onclick="group_modal.showModal()">
            + {{ 'GROUPS.NEW' | translate }}
          </button>
        </div>

        <!-- Loading -->
        @if (service.loading()) {
          <div class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        }

        <!-- List -->
        @if (!service.loading()) {
          @if (service.groups().length === 0) {
            <div class="card bg-base-200">
              <div class="card-body items-center text-center py-12">
                <p class="text-base-content/60">{{ 'GROUPS.EMPTY' | translate }}</p>
              </div>
            </div>
          } @else {
            <div class="grid gap-3">
              @for (group of service.groups(); track group.id) {
                <a [routerLink]="['/groups', group.id]"
                   class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
                  <div class="card-body p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h2 class="card-title text-base">{{ group.name }}</h2>
                        <p class="text-sm text-base-content/60">
                          Inicio: {{ group.startMonth }}/{{ group.startYear }}
                          &bull; {{ group.totalRuedas }} rueda(s)
                        </p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <h3 class="font-bold text-lg mb-4">{{ 'GROUPS.NEW' | translate }}</h3>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">{{ 'GROUPS.NAME' | translate }}</span></label>
          <input type="text" class="input input-bordered" [(ngModel)]="form.name" />
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Mes inicio</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="form.startMonth" min="1" max="12" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Año inicio</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="form.startYear" min="2000" />
          </div>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost mr-2">{{ 'APP.CANCEL' | translate }}</button>
          </form>
          <button class="btn btn-primary" (click)="create()" [disabled]="saving()">
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
