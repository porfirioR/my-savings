import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MembersService } from '../../services/members.service';
import { Member } from '../../models/member.model';
import { UpdateMemberFormGroup } from '../../../../core/forms';

@Component({
  selector: 'app-edit-member-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  template: `
    @if (show && member) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-1">{{ 'MEMBERS.EDIT' | translate }}</h3>
          <p class="text-sm text-base-content/50 mb-4">{{ member.firstName }} {{ member.lastName }}</p>
          <form [formGroup]="form">
            <div class="grid grid-cols-2 gap-3 mb-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.FIRST_NAME' | translate }} <span class="text-error">*</span></legend>
                <input type="text" class="input input-bordered w-full" formControlName="firstName"
                  [class.input-error]="form.controls.firstName.invalid && form.controls.firstName.touched" />
                @if (form.controls.firstName.invalid && form.controls.firstName.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
                }
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.LAST_NAME' | translate }} <span class="text-error">*</span></legend>
                <input type="text" class="input input-bordered w-full" formControlName="lastName"
                  [class.input-error]="form.controls.lastName.invalid && form.controls.lastName.touched" />
                @if (form.controls.lastName.invalid && form.controls.lastName.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.REQUIRED' | translate }}</span>
                }
              </fieldset>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.PHONE' | translate }}</legend>
                <input type="text" class="input input-bordered w-full" formControlName="phone" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ 'MEMBERS.POSITION' | translate }} <span class="text-error">*</span></legend>
                <input type="number" class="input input-bordered w-full" formControlName="position"
                  [class.input-error]="form.controls.position.invalid && form.controls.position.touched" />
                @if (form.controls.position.invalid && form.controls.position.touched) {
                  <span class="text-error text-xs mt-1">{{ 'VALIDATION.POSITION_RANGE' | translate }}</span>
                }
              </fieldset>
            </div>
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ 'MEMBERS.JOINED' | translate }} <span class="text-error">*</span></legend>
              <div class="join w-full">
                <select class="select select-bordered join-item flex-1" formControlName="joinedMonth">
                  @for (m of months; track m) {
                    <option [ngValue]="m">{{ 'MONTHS.' + m | translate }}</option>
                  }
                </select>
                <input type="number" class="input input-bordered join-item w-28" formControlName="joinedYear"
                  [class.input-error]="form.controls.joinedYear.invalid && form.controls.joinedYear.touched" />
              </div>
              @if (form.controls.joinedYear.invalid && form.controls.joinedYear.touched) {
                <span class="text-error text-xs mt-1">{{ 'VALIDATION.YEAR_INVALID' | translate }}</span>
              }
            </fieldset>
          </form>
          <div class="divider my-2"></div>
          <div class="modal-action mt-0">
            <button class="btn btn-ghost" (click)="onCancel()">{{ 'APP.CANCEL' | translate }}</button>
            <button class="btn btn-primary" [disabled]="form.invalid || saving" (click)="save()">
              @if (saving) { <span class="loading loading-spinner loading-xs"></span> }
              {{ 'APP.SAVE' | translate }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="onCancel()"></div>
      </div>
    }
  `,
})
export class EditMemberDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() groupId = '';
  @Input() member: Member | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly service = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  saving = false;
  months = Array.from({ length: 12 }, (_, i) => i + 1);

  form: FormGroup<UpdateMemberFormGroup> = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    position: [1, [Validators.required, Validators.min(1), Validators.max(15)]],
    joinedMonth: [new Date().getMonth() + 1, Validators.required],
    joinedYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  ngOnChanges(): void {
    if (this.show && this.member) {
      this.form.reset({
        firstName: this.member.firstName,
        lastName: this.member.lastName,
        phone: this.member.phone ?? '',
        position: this.member.position,
        joinedMonth: this.member.joinedMonth,
        joinedYear: this.member.joinedYear,
      });
    }
  }

  save(): void {
    if (this.form.invalid || !this.member) return;
    this.saving = true;
    this.service.update(this.groupId, this.member.id, this.form.getRawValue()).subscribe({
      next: () => { this.saving = false; this.saved.emit(); },
      error: () => { this.saving = false; },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
