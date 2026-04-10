import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MembersService } from '../../services/members.service';
import { ExitMemberFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-exit-member-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, DecimalPipe],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'MEMBERS.EXIT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Completa los datos de la baja del miembro.</p>
          <form [formGroup]="form">
            <div class="grid grid-cols-2 gap-3 mb-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.LEFT' | translate }} Mes <span class="text-error">*</span></legend>
                <select class="select select-bordered w-full" formControlName="leftMonth">
                  @for (m of months; track m) {
                    <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                  }
                </select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Año <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="leftYear"
                  [class.input-error]="form.controls.leftYear.invalid && form.controls.leftYear.touched" />
                @if (form.controls.leftYear.invalid && form.controls.leftYear.touched) {
                  <span class="text-error text-xs mt-1">Año inválido</span>
                }
              </fieldset>
            </div>
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">Aportes acumulados (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="accumulatedContributions"
                [class.input-error]="form.controls.accumulatedContributions.invalid && form.controls.accumulatedContributions.touched" />
              @if (form.controls.accumulatedContributions.invalid && form.controls.accumulatedContributions.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">Saldo préstamo restante (Gs) <span class="text-error">*</span></legend>
              <input type="number" class="input input-bordered w-full" formControlName="remainingLoanBalance"
                [class.input-error]="form.controls.remainingLoanBalance.invalid && form.controls.remainingLoanBalance.touched" />
              @if (form.controls.remainingLoanBalance.invalid && form.controls.remainingLoanBalance.touched) {
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
            <button class="btn btn-ghost" (click)="onClose()">{{ 'APP.CLOSE' | translate }}</button>
            @if (!settlement()) {
              <button class="btn btn-warning" [disabled]="form.invalid || saving()" (click)="processExit()">
                @if (saving()) { <span class="loading loading-spinner loading-xs"></span> }
                {{ 'APP.CONFIRM' | translate }}
              </button>
            }
          </div>
        </div>
        <div class="modal-backdrop" (click)="onClose()"></div>
      </div>
    }
  `,
})
export class ExitMemberDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Input() memberId = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  settlement = signal<{ memberReceives: number; memberPays: number } | null>(null);
  months = Array.from({ length: 12 }, (_, i) => i + 1);

  form: FormGroup<ExitMemberFormGroup> = this.fb.nonNullable.group({
    leftMonth: [new Date().getMonth() + 1, Validators.required],
    leftYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    accumulatedContributions: [0, [Validators.required, Validators.min(0)]],
    remainingLoanBalance: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnChanges(): void {
    if (this.show) {
      this.settlement.set(null);
      this.form.reset({
        leftMonth: new Date().getMonth() + 1,
        leftYear: new Date().getFullYear(),
        accumulatedContributions: 0,
        remainingLoanBalance: 0,
      });
    }
  }

  processExit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.service.exit(this.groupId, this.memberId, this.form.getRawValue()).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.settlement.set(result);
        this.saved.emit();
      },
      error: () => { this.saving.set(false); },
    });
  }

  onClose(): void {
    this.settlement.set(null);
    this.closed.emit();
  }
}
