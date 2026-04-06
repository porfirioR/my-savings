import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateRuedaRequest, Rueda, RuedaSlot } from '../models/rueda.model';

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

  suggestLoanAmount(groupId: string): Observable<{ suggested: number }> {
    return this.api.get<{ suggested: number }>(`groups/${groupId}/ruedas/suggest-amount`);
  }
}
