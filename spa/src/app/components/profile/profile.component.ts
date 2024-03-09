import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LocalService } from '../../services/local.service';
import { Observable, of } from 'rxjs';
import { UserApiService } from '../../services/user-api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    RouterModule,

  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('profileModal', { static: true }) profileModal!: ElementRef<HTMLDialogElement>;
  protected hasEmail = false
  protected email?: string | null;

  constructor(
    private readonly localService: LocalService,
    private readonly userService: UserApiService
  ) { }

  ngOnInit(): void {
    this.checkHasEmail()
    this.getUserInformation().subscribe({
      next: (value) => {
        
      }, error: (e) => {
        
        throw e
      }
    })
  }

  ngOnDestroy(): void {
    this.closeDialog()
    // this.cdr.detectChanges();
  }

  public openDialog = (): void => {
    this.profileModal.nativeElement.showModal()
  }

  protected closeDialog = (): void => {
    this.profileModal.nativeElement.close()
  }

  private checkHasEmail = (): void => {
    this.email = this.localService.getEmail()
    if (this.email) {
      this.hasEmail = true
    }
  }
  
  private getUserInformation = (): Observable<unknown | undefined> => {
    return this.hasEmail ? this.userService.getUserInformation(this.localService.getUserId()) : of(undefined);
  }
}
