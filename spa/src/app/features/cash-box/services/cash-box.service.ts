import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CashBalance, CashMovement, CreateMovementRequest, UpdateMovementRequest } from '../models/cash-box.model';

@Injectable({ providedIn: 'root' })
export class CashBoxService {
  private readonly api = inject(ApiService);

  balance = signal<CashBalance>({ totalIn: 0, totalOut: 0, balance: 0 });
  movements = signal<CashMovement[]>([]);
  loading = signal(false);

  loadBalance(groupId: string): void {
    this.api.get<CashBalance>(`groups/${groupId}/cash-box/balance`).subscribe({
      next: data => this.balance.set(data),
    });
  }

  loadMovements(groupId: string): void {
    this.loading.set(true);
    this.api.get<CashMovement[]>(`groups/${groupId}/cash-box/movements`).subscribe({
      next: data => { this.movements.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addMovement(groupId: string, req: CreateMovementRequest): Observable<CashMovement> {
    return this.api.post<CashMovement>(`groups/${groupId}/cash-box/movements`, req).pipe(
      tap(m => {
        this.movements.update(list => [m, ...list]);
        this.loadBalance(groupId);
      }),
    );
  }

  updateMovement(groupId: string, id: string, req: UpdateMovementRequest): Observable<CashMovement> {
    return this.api.put<CashMovement>(`groups/${groupId}/cash-box/movements/${id}`, req).pipe(
      tap(updated => {
        this.movements.update(list => list.map(m => m.id === id ? updated : m));
        this.loadBalance(groupId);
      }),
    );
  }
}
