import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateMemberRequest, ExitMemberRequest, Member } from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly api = inject(ApiService);

  members = signal<Member[]>([]);
  loading = signal(false);

  loadByGroup(groupId: string): void {
    this.loading.set(true);
    this.api.get<Member[]>(`groups/${groupId}/members`).subscribe({
      next: data => { this.members.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create(groupId: string, req: CreateMemberRequest): Observable<Member> {
    return this.api.post<Member>(`groups/${groupId}/members`, req).pipe(
      tap(m => this.members.update(list => [...list, m])),
    );
  }

  exit(groupId: string, memberId: string, req: ExitMemberRequest): Observable<void> {
    return this.api.post<void>(`groups/${groupId}/members/${memberId}/exit`, req).pipe(
      tap(() => this.members.update(list =>
        list.map(m => m.id === memberId
          ? { ...m, isActive: false }
          : m
        )
      )),
    );
  }
}
