import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { ProfileComponent } from "../profile/profile.component";
import { LocalService } from '../../services/local.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: true,
    imports: [
      RouterModule,
      ProfileComponent,
      NgIf
    ]
})
export class HeaderComponent {
  @ViewChild(ProfileComponent) profile: ProfileComponent | undefined;

  protected isLogin: boolean

  constructor(
    private readonly router: Router,
    private readonly localService: LocalService
  ) {
    this.isLogin = !!localService.getEmail()
  }

  protected openProfile = (): void => {
    this.profile?.openDialog()
  }

  protected logOut = (): void => {
    this.localService.cleanCredentials()
    this.router.navigate([''])
  }
}
