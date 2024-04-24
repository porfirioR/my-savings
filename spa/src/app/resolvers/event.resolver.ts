import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map, of } from 'rxjs';
import { EventApiService, LocalService } from '../services';
import { EventViewModel } from '../models/view/event-view-model';

export const eventResolver: ResolveFn<EventViewModel | null> = (route, state) => {
  const eventApiService = inject(EventApiService)
  const localService = inject(LocalService)
  const id = route.params['id']
  return id ? eventApiService.getMyEvent(id).pipe(map(x => new EventViewModel(
    x.id,
    x.name,
    x.authorId,
    localService.getEmail()!,
    x.description,
    x.isActive,
    new Date(x.date),
    x.isPublic,
    new Date()
  ))) : of(null)
};