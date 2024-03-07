import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from "../profile/profile.component";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: true,
    imports: [
      RouterModule,
      ProfileComponent
    ]
})
export class HeaderComponent {
  @ViewChild(ProfileComponent) profile: ProfileComponent | undefined;

  protected openProfile = (): void => {
    this.profile?.openDialog()
  }


}
