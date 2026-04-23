import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateGroupRequest, Group } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly api = inject(ApiService);

  groups = signal<Group[]>([]);
  loading = signal(false);

  loadAll(): void {
    this.loading.set(true);
    this.api.get<Group[]>('groups').subscribe({
      next: data => { this.groups.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create(req: CreateGroupRequest): Observable<Group> {
    return this.api.post<Group>('groups', req).pipe(
      tap(g => this.groups.update(list => [g, ...list])),
    );
  }
}
