import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateRuedaRequest, Rueda, RuedaSlot, RuedaTimelineMonth, UpdateRuedaRequest } from '../models/rueda.model';

@Injectable({ providedIn: 'root' })
export class RuedasService {
  private readonly api = inject(ApiService);

  ruedas = signal<Rueda[]>([]);
  slots = signal<RuedaSlot[]>([]);
  loading = signal(false);

  loadByGroup(groupId: string): void {
    this.loading.set(true);
    this.api.get<Rueda[]>(`groups/${groupId}/ruedas`).subscribe({
      next: data => { this.ruedas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getById(groupId: string, ruedaId: string): Observable<Rueda> {
    return this.api.get<Rueda>(`groups/${groupId}/ruedas/${ruedaId}`);
  }

  loadSlots(groupId: string, ruedaId: string): void {
    this.api.get<RuedaSlot[]>(`groups/${groupId}/ruedas/${ruedaId}/slots`).subscribe({
      next: data => this.slots.set(data),
    });
  }

  create(groupId: string, req: CreateRuedaRequest): Observable<Rueda> {
    return this.api.post<Rueda>(`groups/${groupId}/ruedas`, req).pipe(
      tap(r => this.ruedas.update(list => [...list, r])),
    );
  }

  update(groupId: string, ruedaId: string, req: UpdateRuedaRequest): Observable<Rueda> {
    return this.api.put<Rueda>(`groups/${groupId}/ruedas/${ruedaId}`, req).pipe(
      tap(updated => this.ruedas.update(list => list.map(r => r.id === ruedaId ? updated : r))),
    );
  }

  delete(groupId: string, ruedaId: string): Observable<void> {
    return this.api.delete<void>(`groups/${groupId}/ruedas/${ruedaId}`).pipe(
      tap(() => this.ruedas.update(list => list.filter(r => r.id !== ruedaId))),
    );
  }

  suggestLoanAmount(groupId: string): Observable<{ suggested: number }> {
    return this.api.get<{ suggested: number }>(`groups/${groupId}/ruedas/suggest-amount`);
  }

  getTimeline(groupId: string, ruedaId: string): Observable<RuedaTimelineMonth[]> {
    return this.api.get<RuedaTimelineMonth[]>(`groups/${groupId}/ruedas/${ruedaId}/timeline`);
  }
}
