import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ForgotPasswordFormGroup } from '../../models/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,]
})
export class ForgotPasswordComponent implements OnInit {
  protected formGroup: FormGroup<ForgotPasswordFormGroup>

  constructor() {
    this.formGroup = new FormGroup<ForgotPasswordFormGroup>({
      email: new FormControl(null, [Validators.required, Validators.email])
    })
  }

  ngOnInit() {
  }

  protected sendCode = () => {

  }

}
