import { Routes } from '@angular/router'
import { HomeComponent } from './components/home/home.component'
import { MyEventsComponent } from './components/my-events/my-events.component'

export const routes: Routes = [
  {
    path: '',
    title: 'Principal',
    children: [
      {
        path: '',
        title: 'Principal',
        loadComponent: () => HomeComponent
      },
      {
        path: 'my-events',
        title: 'My events',
        loadComponent: () => MyEventsComponent
      },
    ]
  }
]
