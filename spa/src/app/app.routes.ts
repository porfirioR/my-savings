import { Routes } from '@angular/router'
import { HomeComponent } from './components/home/home.component'
import { MyEventsComponent } from './components/my-events/my-events.component'

export const routes: Routes = [
  {
    path: 'principal',
    title: 'Principal',
    loadComponent: () => HomeComponent
  },
  {
    path: 'my-events',
    title: 'My events',
    loadComponent: () => MyEventsComponent
  },
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full'
  }
]
