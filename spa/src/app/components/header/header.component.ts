import { Component, ViewChild } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { NgIf } from '@angular/common'
import { ProfileComponent } from "../profile/profile.component"
import { AlertService, LocalService } from '../../services'

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
  @ViewChild(ProfileComponent) profile: ProfileComponent | undefined

  protected isLogin: boolean = false

  constructor(
    private readonly router: Router,
    private readonly localService: LocalService,
    private readonly alertService: AlertService,
  ) {
    this.checkLogin()
  }

  protected openProfile = (): void => {
    this.isLogin = !!this.localService.getEmail()
    this.profile?.openDialog()
  }

  protected logOut = (): void => {
    this.localService.cleanCredentials()
    this.alertService.showSuccess('Good bye.')
    this.checkLogin()
    this.profile?.ngOnDestroy()
    this.router.navigate([''])
  }

  protected checkLogin = (): void => {
    this.isLogin = !!this.localService.getEmail()
  }
}
