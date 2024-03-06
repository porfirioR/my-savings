import { Component, OnInit } from '@angular/core';
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
  protected openProfile = (): void => {
    throw new Error('Method not implemented.');
  }


}
