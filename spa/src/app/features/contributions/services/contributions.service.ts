import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ContributionPeriod,
  ContributionsMatrix,
  CreateContributionPeriodRequest,
  UpdateContributionPeriodRequest,
  UpsertManualContributionRequest,
} from '../models/contribution.model';

@Injectable({ providedIn: 'root' })
export class ContributionsService {
  private readonly api = inject(ApiService);

  matrix = signal<ContributionsMatrix>({ columns: [], rows: [] });
  loading = signal(false);

  loadMatrix(groupId: string): void {
    this.loading.set(true);
    this.api.get<ContributionsMatrix>(`groups/${groupId}/contributions`).subscribe({
      next: data => { this.matrix.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createPeriod(groupId: string, req: CreateContributionPeriodRequest): Observable<ContributionPeriod> {
    return this.api.post<ContributionPeriod>(`groups/${groupId}/contributions/periods`, req).pipe(
      tap(() => this.loadMatrix(groupId)),
    );
  }

  updatePeriod(groupId: string, id: string, req: UpdateContributionPeriodRequest): Observable<ContributionPeriod> {
    return this.api.put<ContributionPeriod>(`groups/${groupId}/contributions/periods/${id}`, req).pipe(
      tap(() => this.loadMatrix(groupId)),
    );
  }

  deletePeriod(groupId: string, id: string): Observable<void> {
    return this.api.delete<void>(`groups/${groupId}/contributions/periods/${id}`).pipe(
      tap(() => this.loadMatrix(groupId)),
    );
  }

  upsertManualContribution(groupId: string, req: UpsertManualContributionRequest): Observable<void> {
    return this.api.put<void>(`groups/${groupId}/contributions/manual`, req).pipe(
      tap(() => this.loadMatrix(groupId)),
    );
  }

  updateRuedaLabel(groupId: string, ruedaId: string, label: string): Observable<void> {
    return this.api.put<void>(`groups/${groupId}/contributions/rueda-label/${ruedaId}`, { label }).pipe(
      tap(() => this.loadMatrix(groupId)),
    );
  }
}
