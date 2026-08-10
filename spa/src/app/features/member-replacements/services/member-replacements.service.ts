import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  CreateMemberReplacementRequest,
  CreateMemberReplacementResult,
  MemberReplacement,
  MemberReplacementSchedule,
} from '../models/member-replacement.model';

@Injectable({ providedIn: 'root' })
export class MemberReplacementsService {
  private readonly api = inject(ApiService);

  replacements = signal<MemberReplacement[]>([]);
  loading = signal(false);

  loadByGroup(groupId: string): void {
    this.loading.set(true);
    this.api.get<MemberReplacement[]>(`groups/${groupId}/member-replacements`).subscribe({
      next: data => { this.replacements.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getSchedule(groupId: string, replacementId: string): Observable<MemberReplacementSchedule[]> {
    return this.api.get<MemberReplacementSchedule[]>(`groups/${groupId}/member-replacements/${replacementId}/schedule`);
  }

  previewOutgoingAmount(groupId: string, memberId: string): Observable<{ outgoingMonthlyAmount: number }> {
    return this.api.get<{ outgoingMonthlyAmount: number }>(`groups/${groupId}/member-replacements/preview-outgoing-amount/${memberId}`);
  }

  create(groupId: string, req: CreateMemberReplacementRequest): Observable<CreateMemberReplacementResult> {
    return this.api.post<CreateMemberReplacementResult>(`groups/${groupId}/member-replacements`, req).pipe(
      tap(res => this.replacements.update(list => [res.replacement, ...list])),
    );
  }

  markSchedule(groupId: string, scheduleId: string, side: 'outgoing' | 'incoming', paid: boolean): Observable<MemberReplacementSchedule> {
    return this.api.put<MemberReplacementSchedule>(`groups/${groupId}/member-replacements/schedule/${scheduleId}/mark`, { side, paid });
  }

  updateScheduleAmount(groupId: string, scheduleId: string, side: 'outgoing' | 'incoming', amount: number): Observable<MemberReplacementSchedule> {
    return this.api.put<MemberReplacementSchedule>(`groups/${groupId}/member-replacements/schedule/${scheduleId}/amount`, { side, amount });
  }
}
