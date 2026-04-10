import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GroupsService } from '../../services/groups.service';
import { CreateGroupFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'GROUPS.NEW' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">Completa los datos del nuevo grupo de ahorro.</p>
          <form [formGroup]="form">
            <fieldset class="fieldset mb-3">
              <legend class="fieldset-legend">{{ 'GROUPS.NAME' | translate }} <span class="text-error">*</span></legend>
              <input type="text" class="input input-bordered w-full" formControlName="name"
                [class.input-error]="form.controls.name.invalid && form.controls.name.touched" />
              @if (form.controls.name.invalid && form.controls.name.touched) {
                <span class="text-error text-xs mt-1">Campo requerido</span>
              }
            </fieldset>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Mes inicio <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="startMonth"
                  [class.input-error]="form.controls.startMonth.invalid && form.controls.startMonth.touched" />
                @if (form.controls.startMonth.invalid && form.controls.startMonth.touched) {
                  <span class="text-error text-xs mt-1">Valor entre 1 y 12</span>
                }
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Año inicio <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="startYear"
                  [class.input-error]="form.controls.startYear.invalid && form.controls.startYear.touched" />
                @if (form.controls.startYear.invalid && form.controls.startYear.touched) {
                  <span class="text-error text-xs mt-1">Año inválido</span>
                }
              </fieldset>
            </div>
          </form>
          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onCancel()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="form.invalid || saving">
              @if (saving) { <span class="loading loading-spinner loading-sm"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onCancel()"></div>
      </div>
    }
  `,
})
export class CreateGroupDialogComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(GroupsService);
  private readonly fb = inject(FormBuilder);

  saving = false;

  form: FormGroup<CreateGroupFormGroup> = this.fb.nonNullable.group({
    name: ['', Validators.required],
    startMonth: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
    startYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.service.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.form.reset({ name: '', startMonth: 1, startYear: new Date().getFullYear() });
        this.saved.emit();
      },
      error: () => { this.saving = false; },
    });
  }

  onCancel(): void {
    this.form.reset({ name: '', startMonth: 1, startYear: new Date().getFullYear() });
    this.closed.emit();
  }
}
