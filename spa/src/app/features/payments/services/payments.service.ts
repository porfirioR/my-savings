import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { GeneratePaymentsRequest, MonthlyPayment, PaymentSummary } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly api = inject(ApiService);

  payments = signal<MonthlyPayment[]>([]);
  loading = signal(false);

  get summary(): PaymentSummary {
    const list = this.payments();
    return {
      totalCollected: list.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0),
      totalPending: list.filter(p => p.status === 'pending').reduce((s, p) => s + p.totalAmount, 0),
      paidCount: list.filter(p => p.status === 'paid').length,
      pendingCount: list.filter(p => p.status === 'pending').length,
    };
  }

  clearPayments(): void {
    this.payments.set([]);
  }

  loadByMonth(groupId: string, ruedaId: string, month: number, year: number): void {
    this.loading.set(true);
    this.api.get<MonthlyPayment[]>(`groups/${groupId}/ruedas/${ruedaId}/payments`, { month, year }).subscribe({
      next: data => { this.payments.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  generate(groupId: string, ruedaId: string, req: GeneratePaymentsRequest): Observable<MonthlyPayment[]> {
    return this.api.post<MonthlyPayment[]>(`groups/${groupId}/ruedas/${ruedaId}/payments/generate`, req).pipe(
      tap(data => this.payments.set(data)),
    );
  }

  markPaid(groupId: string, ruedaId: string, paymentId: string): Observable<void> {
    return this.api.post<void>(`groups/${groupId}/ruedas/${ruedaId}/payments/${paymentId}/mark-paid`, {}).pipe(
      tap(() => this.payments.update(list =>
        list.map(p => p.id === paymentId ? { ...p, status: 'paid' as const, paidAt: new Date().toISOString() } : p)
      )),
    );
  }

  markUnpaid(groupId: string, ruedaId: string, paymentId: string): Observable<void> {
    return this.api.post<void>(`groups/${groupId}/ruedas/${ruedaId}/payments/${paymentId}/mark-unpaid`, {}).pipe(
      tap(() => this.payments.update(list =>
        list.map(p => p.id === paymentId ? { ...p, status: 'pending' as const, paidAt: null } : p)
      )),
    );
  }
}
