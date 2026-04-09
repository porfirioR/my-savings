import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MembersService } from '../../services/members.service';
import { CreateMemberRequest, ExitMemberRequest } from '../../models/member.model';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'MEMBERS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openAddModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ 'MEMBERS.ADD' | translate }}
        </button>
      </div>
      <div class="divider mt-0 mb-6"></div>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (service.members().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'MEMBERS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto rounded-box border border-base-300">
          <table class="table table-pin-rows w-full text-sm">
            <thead>
              <tr class="bg-base-200">
                <th class="w-10">#</th>
                <th>{{ 'MEMBERS.FIRST_NAME' | translate }}</th>
                <th>{{ 'MEMBERS.LAST_NAME' | translate }}</th>
                <th>{{ 'MEMBERS.PHONE' | translate }}</th>
                <th class="text-center">{{ 'MEMBERS.POSITION' | translate }}</th>
                <th>{{ 'MEMBERS.JOINED' | translate }}</th>
                <th class="text-center">{{ 'MEMBERS.STATUS' | translate }}</th>
                <th class="text-center">{{ 'APP.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of service.members(); track m.id; let i = $index) {
                <tr class="hover:bg-base-200/50">
                  <td class="text-base-content/40 text-xs">{{ i + 1 }}</td>
                  <td class="font-medium">{{ m.firstName }}</td>
                  <td>{{ m.lastName }}</td>
                  <td class="text-base-content/60">{{ m.phone ?? '-' }}</td>
                  <td class="text-center">{{ m.position }}</td>
                  <td class="text-base-content/60">{{ 'MONTHS.' + m.joinedMonth | translate }} {{ m.joinedYear }}</td>
                  <td class="text-center">
                    <span class="badge badge-sm badge-outline"
                      [class.badge-success]="m.isActive"
                      [class.badge-error]="!m.isActive">
                      {{ (m.isActive ? 'MEMBERS.ACTIVE' : 'MEMBERS.INACTIVE') | translate }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (m.isActive) {
                      <button class="btn btn-ghost btn-xs text-warning hover:text-warning" (click)="openExitModal(m.id)">
                        {{ 'MEMBERS.EXIT' | translate }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Add Member Modal -->
    @if (showAddModal()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'MEMBERS.ADD' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Ingresa los datos del nuevo miembro.</p>
          <form #addMemberForm="ngForm">
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'MEMBERS.FIRST_NAME' | translate }} <span class="text-error">*</span></legend>
              <input type="text" class="input input-bordered w-full" name="firstName"
                [(ngModel)]="addForm.firstName" required #firstName="ngModel"
                [class.input-error]="firstName.invalid && firstName.touched" />
              @if (firstName.invalid && firstName.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'MEMBERS.LAST_NAME' | translate }} <span class="text-error">*</span></legend>
              <input type="text" class="input input-bordered w-full" name="lastName"
                [(ngModel)]="addForm.lastName" required #lastName="ngModel"
                [class.input-error]="lastName.invalid && lastName.touched" />
              @if (lastName.invalid && lastName.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'MEMBERS.PHONE' | translate }}</legend>
              <input type="text" class="input input-bordered w-full" name="phone" [(ngModel)]="addForm.phone" />
            </fieldset>
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'MEMBERS.POSITION' | translate }} <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="position"
                [(ngModel)]="addForm.position" required min="1" max="15" #position="ngModel"
                [class.input-error]="position.invalid && position.touched" />
              @if (position.invalid && position.touched) {
                <span class="text-error text-xs mt-1">Posición entre 1 y 15</span>
              }
            </fieldset>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.JOINED' | translate }} Mes <span class="text-error">*</span></legend>
                <select class="select select-bordered w-full" name="joinedMonth" [(ngModel)]="addForm.joinedMonth" required>
                  @for (m of months; track m) {
                    <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                  }
                </select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Año <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" name="joinedYear"
                  [(ngModel)]="addForm.joinedYear" required min="2000" #joinedYear="ngModel"
                  [class.input-error]="joinedYear.invalid && joinedYear.touched" />
                @if (joinedYear.invalid && joinedYear.touched) {
                  <span class="text-error text-xs mt-1">Año inválido</span>
                }
              </fieldset>
            </div>
          </form>
          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="closeAddModal()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="addMemberForm.invalid || saving()" (click)="save()">
              @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="closeAddModal()"></div>
      </div>
    }

    <!-- Exit Member Modal -->
    @if (showExitModal()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'MEMBERS.EXIT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Completa los datos de la baja del miembro.</p>
          <form #exitMemberForm="ngForm">
          <div class="grid grid-cols-2 gap-3 mb-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ 'MEMBERS.LEFT' | translate }} Mes <span class="text-error">*</span></legend>
              <select class="select select-bordered w-full" name="leftMonth"
                [(ngModel)]="exitForm.leftMonth" required>
                @for (m of months; track m) {
                  <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                }
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Año <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" name="leftYear"
                [(ngModel)]="exitForm.leftYear" required min="2000" #leftYear="ngModel"
                [class.input-error]="leftYear.invalid && leftYear.touched" />
              @if (leftYear.invalid && leftYear.touched) {
                <span class="text-error text-xs mt-1">Año inválido</span>
              }
            </fieldset>
          </div>
          <fieldset class="fieldset mb-3">
            <legend class="fieldset-legend">Aportes acumulados (Gs) <span class="text-error">*</span></legend>
            <input type="number" class="input input-bordered w-full" name="accumulatedContributions"
              [(ngModel)]="exitForm.accumulatedContributions" required min="0" #accContrib="ngModel"
              [class.input-error]="accContrib.invalid && accContrib.touched" />
            @if (accContrib.invalid && accContrib.touched) {
              <span class="text-error text-xs mt-1">Campo requerido</span>
            }
          </fieldset>
          <fieldset class="fieldset mb-4">
            <legend class="fieldset-legend">Saldo préstamo restante (Gs) <span class="text-error">*</span></legend>
            <input type="number" class="input input-bordered w-full" name="remainingLoanBalance"
              [(ngModel)]="exitForm.remainingLoanBalance" required min="0" #remainingBalance="ngModel"
              [class.input-error]="remainingBalance.invalid && remainingBalance.touched" />
            @if (remainingBalance.invalid && remainingBalance.touched) {
              <span class="text-error text-xs mt-1">Campo requerido</span>
            }
          </fieldset>
          </form>
          @if (settlement()) {
            @if (settlement()!.memberReceives > 0) {
              <div class="alert alert-success mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>El miembro <strong>recibe</strong> {{ settlement()!.memberReceives | number:'1.0-0' }} Gs de la caja.</span>
              </div>
            } @else if (settlement()!.memberPays > 0) {
              <div class="alert alert-warning mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>El miembro <strong>debe pagar</strong> {{ settlement()!.memberPays | number:'1.0-0' }} Gs a la caja.</span>
              </div>
            } @else {
              <div class="alert mb-3">
                <span>Sin diferencia. Liquidación en cero.</span>
              </div>
            }
          }
          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="closeExitModal()">{{ 'APP.CLOSE' | translate }}</button>
            @if (!settlement()) {
              <button class="btn btn-warning" [disabled]="exitMemberForm.invalid || saving()" (click)="processExit()">
                @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
                {{ 'APP.CONFIRM' | translate }}
              </button>
            }
          </div>
        </div>
        <div class="modal-backdrop" (click)="closeExitModal()"></div>
      </div>
    }
  `,
})
export class MemberListComponent implements OnInit {
  readonly service = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  private groupId = '';
  saving = signal(false);
  showAddModal = signal(false);
  showExitModal = signal(false);
  selectedMemberId = signal('');
  settlement = signal<{ memberReceives: number; memberPays: number } | null>(null);

  months = Array.from({ length: 12 }, (_, i) => i + 1);
  addForm: CreateMemberRequest = { firstName: '', lastName: '', phone: '', position: 1, joinedMonth: new Date().getMonth() + 1, joinedYear: new Date().getFullYear() };
  exitForm: ExitMemberRequest = { leftMonth: new Date().getMonth() + 1, leftYear: new Date().getFullYear(), accumulatedContributions: 0, remainingLoanBalance: 0 };

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
  }

  openAddModal(): void {
    this.addForm = { firstName: '', lastName: '', phone: '', position: 1, joinedMonth: new Date().getMonth() + 1, joinedYear: new Date().getFullYear() };
    this.showAddModal.set(true);
  }

  closeAddModal(): void { this.showAddModal.set(false); }

  openExitModal(memberId: string): void {
    this.selectedMemberId.set(memberId);
    this.settlement.set(null);
    this.exitForm = { leftMonth: new Date().getMonth() + 1, leftYear: new Date().getFullYear(), accumulatedContributions: 0, remainingLoanBalance: 0 };
    this.showExitModal.set(true);
  }

  closeExitModal(): void { this.showExitModal.set(false); this.settlement.set(null); }

  save(): void {
    if (!this.addForm.firstName || !this.addForm.lastName) return;
    this.saving.set(true);
    this.service.create(this.groupId, this.addForm).subscribe({
      next: () => { this.saving.set(false); this.closeAddModal(); },
      error: () => this.saving.set(false),
    });
  }

  processExit(): void {
    if (!this.exitForm.leftMonth || !this.exitForm.leftYear) return;
    this.saving.set(true);
    this.service.exit(this.groupId, this.selectedMemberId(), this.exitForm).subscribe({
      next: (result) => { this.saving.set(false); this.settlement.set(result); },
      error: () => this.saving.set(false),
    });
  }
}
