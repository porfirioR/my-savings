import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateParallelLoanRequest, ParallelLoan, ParallelLoanPayment, UpdateParallelLoanRequest } from '../models/parallel-loan.model';

@Injectable({ providedIn: 'root' })
export class ParallelLoansService {
  private readonly api = inject(ApiService);

  loans = signal<ParallelLoan[]>([]);
  payments = signal<ParallelLoanPayment[]>([]);
  loading = signal(false);

  loadByGroup(groupId: string): void {
    this.loading.set(true);
    this.api.get<ParallelLoan[]>(`groups/${groupId}/parallel-loans`).subscribe({
      next: data => { this.loans.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadPayments(groupId: string, loanId: string): void {
    this.api.get<ParallelLoanPayment[]>(`groups/${groupId}/parallel-loans/${loanId}/payments`).subscribe({
      next: data => this.payments.set(data),
    });
  }

  create(groupId: string, req: CreateParallelLoanRequest): Observable<ParallelLoan> {
    return this.api.post<ParallelLoan>(`groups/${groupId}/parallel-loans`, req).pipe(
      tap(l => this.loans.update(list => [l, ...list])),
    );
  }

  update(groupId: string, loanId: string, req: UpdateParallelLoanRequest): Observable<ParallelLoan> {
    return this.api.put<ParallelLoan>(`groups/${groupId}/parallel-loans/${loanId}`, req).pipe(
      tap(updated => this.loans.update(list => list.map(l => l.id === loanId ? updated : l))),
    );
  }

  markPayment(groupId: string, loanId: string, paymentId: string): Observable<void> {
    return this.api.post<void>(`groups/${groupId}/parallel-loans/${loanId}/payments/${paymentId}/mark-paid`, {}).pipe(
      tap(() => {
        this.payments.update(list =>
          list.map(p => p.id === paymentId ? { ...p, status: 'paid' as const, paidAt: new Date().toISOString() } : p)
        );
        this.loans.update(list =>
          list.map(l => l.id === loanId
            ? { ...l, installmentsPaid: l.installmentsPaid + 1, status: l.installmentsPaid + 1 >= l.totalInstallments ? 'completed' as const : l.status }
            : l
          )
        );
      }),
    );
  }
}
