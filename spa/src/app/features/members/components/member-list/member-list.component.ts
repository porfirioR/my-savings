import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MembersService } from '../../services/members.service';
import { Member } from '../../models/member.model';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { EditMemberDialogComponent } from '../edit-member-dialog/edit-member-dialog.component';
import { ExitMemberDialogComponent } from '../exit-member-dialog/exit-member-dialog.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [TranslateModule, AddMemberDialogComponent, EditMemberDialogComponent, ExitMemberDialogComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold tracking-tight">{{ 'MEMBERS.TITLE' | translate }}</h2>
        <button class="btn btn-primary btn-sm" (click)="openAddModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ 'MEMBERS.ADD' | translate }}
        </button>
      </div>
      <div class="divider mt-0 mb-6"></div>

      @if (service.loading()) {
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (service.members().length === 0) {
        <div class="text-center py-16 text-base-content/50 text-sm">
          {{ 'MEMBERS.EMPTY' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto rounded-box border border-base-300">
          <table class="table table-pin-rows w-full text-sm">
            <thead>
              <tr class="bg-base-200">
                <th class="w-10">#</th>
                <th>{{ 'MEMBERS.FIRST_NAME' | translate }}</th>
                <th>{{ 'MEMBERS.LAST_NAME' | translate }}</th>
                <th>{{ 'MEMBERS.PHONE' | translate }}</th>
                <th class="text-center">{{ 'MEMBERS.POSITION' | translate }}</th>
                <th>{{ 'MEMBERS.JOINED' | translate }}</th>
                <th class="text-center">{{ 'MEMBERS.STATUS' | translate }}</th>
                <th class="text-center">{{ 'APP.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of service.members(); track m.id; let i = $index) {
                <tr class="hover:bg-base-200/50">
                  <td class="text-base-content/40 text-xs">{{ i + 1 }}</td>
                  <td class="font-medium">{{ m.firstName }}</td>
                  <td>{{ m.lastName }}</td>
                  <td class="text-base-content/60">{{ m.phone ?? '-' }}</td>
                  <td class="text-center">{{ m.position }}</td>
                  <td class="text-base-content/60">{{ 'MONTHS.' + m.joinedMonth | translate }} {{ m.joinedYear }}</td>
                  <td class="text-center">
                    <span class="badge badge-sm badge-outline"
                      [class.badge-success]="m.isActive"
                      [class.badge-error]="!m.isActive">
                      {{ (m.isActive ? 'MEMBERS.ACTIVE' : 'MEMBERS.INACTIVE') | translate }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button class="btn btn-ghost btn-xs" (click)="openEditModal(m)" title="{{ 'APP.EDIT' | translate }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      @if (m.isActive) {
                        <button class="btn btn-ghost btn-xs text-warning hover:text-warning" (click)="openExitModal(m.id)">
                          {{ 'MEMBERS.EXIT' | translate }}
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <app-add-member-dialog
      [show]="showAddModal()"
      [groupId]="groupId"
      (closed)="showAddModal.set(false)"
      (saved)="showAddModal.set(false)" />

    <app-edit-member-dialog
      [show]="showEditModal()"
      [groupId]="groupId"
      [member]="selectedMember()"
      (closed)="showEditModal.set(false)"
      (saved)="showEditModal.set(false)" />

    <app-exit-member-dialog
      [show]="showExitModal()"
      [groupId]="groupId"
      [memberId]="selectedMemberId()"
      (closed)="showExitModal.set(false)"
      (saved)="showExitModal.set(false)" />
  `,
})
export class MemberListComponent implements OnInit {
  readonly service = inject(MembersService);
  private readonly route = inject(ActivatedRoute);

  groupId = '';
  showAddModal = signal(false);
  showEditModal = signal(false);
  showExitModal = signal(false);
  selectedMember = signal<Member | null>(null);
  selectedMemberId = signal('');

  ngOnInit(): void {
    this.groupId = this.route.snapshot.parent?.paramMap.get('groupId') ?? '';
    this.service.loadByGroup(this.groupId);
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  openEditModal(member: Member): void {
    this.selectedMember.set(member);
    this.showEditModal.set(true);
  }

  openExitModal(memberId: string): void {
    this.selectedMemberId.set(memberId);
    this.showExitModal.set(true);
  }
}
