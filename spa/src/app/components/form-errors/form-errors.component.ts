import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

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
export class FormErrorsComponent {
  @Input() control: FormControl | null = null
  @Input() Name: string = ''
  protected errors: string[] = []

  constructor() {
    const validationErrors = this.control?.errors
    this.errors = validationErrors ? Object.keys(validationErrors) : []
  }

  hasError(errorCode: string): boolean {
    return this.control?.errors?.hasOwnProperty(errorCode) ?? false
  }

  getErrorMessage(errorCode: string): string {
    const errorMessages: {[index: string]: string} = {
      required: 'This field is required.',
      minlength: 'Minimum length is not met.',
      maxlength: 'Maximum length exceeded.',
      invalidRepeatPassword: 'The password not is the same.',
    }

    return errorMessages[errorCode] || 'An error occurred.';
  }
}
