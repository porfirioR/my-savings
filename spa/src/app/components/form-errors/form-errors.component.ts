import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-form-errors',
  standalone: true,
  imports: [
    NgIf,
    NgFor,

  ],
  templateUrl: './form-errors.component.html',
  styleUrl: './form-errors.component.css'
})
export class FormErrorsComponent implements ControlValueAccessor {
  @Input() label: string = ''

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this
    // const validationErrors = this.control?.errors
    // this.errors = validationErrors ? Object.keys(validationErrors) : []
  }

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

  // getErrorMessage(errorCode: string): string {
  //   const errorMessages: {[index: string]: string} = {
  //     required: 'This field is required.',
  //     minlength: 'Minimum length is not met.',
  //     maxlength: 'Maximum length exceeded.',
  //     invalidRepeatPassword: 'The password not is the same.',
  //   }

  //   return errorMessages[errorCode] || 'An error occurred.';
  // }
}
