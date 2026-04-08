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
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ 'MEMBERS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openAddModal()">
          {{ 'MEMBERS.ADD' | translate }}
        </button>
      </div>

      @if (service.loading()) {
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      } @else if (service.members().length === 0) {
        <div class="text-center py-8 text-base-content/50">
          {{ 'MEMBERS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ 'MEMBERS.FIRST_NAME' | translate }}</th>
                <th>{{ 'MEMBERS.LAST_NAME' | translate }}</th>
                <th>{{ 'MEMBERS.PHONE' | translate }}</th>
                <th>{{ 'MEMBERS.POSITION' | translate }}</th>
                <th>{{ 'MEMBERS.JOINED' | translate }}</th>
                <th>{{ 'MEMBERS.STATUS' | translate }}</th>
                <th>{{ 'APP.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of service.members(); track m.id; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td>{{ m.firstName }}</td>
                  <td>{{ m.lastName }}</td>
                  <td>{{ m.phone ?? '-' }}</td>
                  <td>{{ m.position }}</td>
                  <td>{{ 'MONTHS.' + m.joinedMonth | translate }} {{ m.joinedYear }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="m.isActive" [class.badge-error]="!m.isActive">
                      {{ (m.isActive ? 'MEMBERS.ACTIVE' : 'MEMBERS.INACTIVE') | translate }}
                    </span>
                  </td>
                  <td>
                    @if (m.isActive) {
                      <button class="btn btn-warning btn-xs" (click)="openExitModal(m.id)">
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
          <h3 class="font-bold text-lg mb-4">{{ 'MEMBERS.ADD' | translate }}</h3>
          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'MEMBERS.FIRST_NAME' | translate }}</span></label>
            <input type="text" class="input input-bordered" [(ngModel)]="addForm.firstName" />
          </div>
          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'MEMBERS.LAST_NAME' | translate }}</span></label>
            <input type="text" class="input input-bordered" [(ngModel)]="addForm.lastName" />
          </div>
          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'MEMBERS.PHONE' | translate }}</span></label>
            <input type="text" class="input input-bordered" [(ngModel)]="addForm.phone" />
          </div>
          <div class="form-control mb-3">
            <label class="label"><span class="label-text">{{ 'MEMBERS.POSITION' | translate }}</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="addForm.position" min="1" max="15" />
          </div>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'MEMBERS.JOINED' | translate }} Mes</span></label>
              <select class="select select-bordered" [(ngModel)]="addForm.joinedMonth">
                @for (m of months; track m) {
                  <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Año</span></label>
              <input type="number" class="input input-bordered" [(ngModel)]="addForm.joinedYear" />
            </div>
          </div>
          <div class="modal-action">
            <button class="btn btn-ghost" (click)="closeAddModal()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
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
          <h3 class="font-bold text-lg mb-4">{{ 'MEMBERS.EXIT' | translate }}</h3>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="form-control">
              <label class="label"><span class="label-text">{{ 'MEMBERS.LEFT' | translate }} Mes</span></label>
              <select class="select select-bordered" [(ngModel)]="exitForm.leftMonth">
                @for (m of months; track m) {
                  <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                }
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Año</span></label>
              <input type="number" class="input input-bordered" [(ngModel)]="exitForm.leftYear" />
            </div>
          </div>
          <div class="form-control mb-3">
            <label class="label"><span class="label-text">Aportes acumulados (Gs)</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="exitForm.accumulatedContributions" min="0" />
          </div>
          <div class="form-control mb-4">
            <label class="label"><span class="label-text">Saldo préstamo restante (Gs)</span></label>
            <input type="number" class="input input-bordered" [(ngModel)]="exitForm.remainingLoanBalance" min="0" />
          </div>
          @if (settlement()) {
            <div class="alert mt-2" [class.alert-success]="settlement()!.memberReceives > 0" [class.alert-warning]="settlement()!.memberPays > 0" [class.alert-info]="settlement()!.memberReceives === 0 && settlement()!.memberPays === 0">
              @if (settlement()!.memberReceives > 0) {
                <span>El miembro <strong>recibe</strong> {{ settlement()!.memberReceives | number:'1.0-0' }} Gs de la caja.</span>
              } @else if (settlement()!.memberPays > 0) {
                <span>El miembro <strong>debe pagar</strong> {{ settlement()!.memberPays | number:'1.0-0' }} Gs a la caja.</span>
              } @else {
                <span>Sin diferencia. Liquidación en cero.</span>
              }
            </div>
          }
          <div class="modal-action">
            <button class="btn btn-ghost" (click)="closeExitModal()">{{ 'APP.CLOSE' | translate }}</button>
            @if (!settlement()) {
              <button class="btn btn-warning" [disabled]="saving()" (click)="processExit()">
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
