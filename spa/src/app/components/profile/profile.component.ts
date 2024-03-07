import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: []
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('profileModal', { static: true }) profileModal!: ElementRef<HTMLDialogElement>;

  constructor() { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.profileModal.nativeElement.close()
    // this.cdr.detectChanges();
  }

  public openDialog = (): void => {
    this.profileModal.nativeElement.showModal()
  }

  protected closeDialog = (): void => {
    this.profileModal.nativeElement.close()
  }
}
