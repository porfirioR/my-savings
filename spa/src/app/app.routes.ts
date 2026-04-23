import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'groups',
    pathMatch: 'full',
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('./features/groups/components/group-list/group-list.component').then(
        m => m.GroupListComponent,
      ),
  },
  {
    path: 'groups/:groupId',
    loadComponent: () =>
      import('./layout/group-shell/group-shell.component').then(
        m => m.GroupShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'rueda', pathMatch: 'full' },
      {
        path: 'rueda',
        loadComponent: () =>
          import('./features/payments/components/payment-list/payment-list.component').then(
            m => m.PaymentListComponent,
          ),
      },
      {
        path: 'ruedas',
        loadComponent: () =>
          import('./features/ruedas/components/rueda-list/rueda-list.component').then(
            m => m.RuedaListComponent,
          ),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./features/members/components/member-list/member-list.component').then(
            m => m.MemberListComponent,
          ),
      },
      {
        path: 'parallel-loans',
        loadComponent: () =>
          import('./features/parallel-loans/components/parallel-loan-list/parallel-loan-list.component').then(
            m => m.ParallelLoanListComponent,
          ),
      },
      {
        path: 'cash-box',
        loadComponent: () =>
          import('./features/cash-box/components/cash-box/cash-box.component').then(
            m => m.CashBoxComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'groups' },
];
