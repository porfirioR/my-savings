import { Routes } from '@angular/router'
import { HomeComponent } from './components/home/home.component'
import { MyEventsComponent } from './components/my-events/my-events.component'
import { LoginComponent } from './components/login/login.component'
import { SignupComponent } from './components/signup/signup.component'
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component'
import { loadingResolver } from './resolvers/loading.resolver'

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
        loadComponent: () => MyEventsComponent,
        resolve: { loading: loadingResolver }
      },
      {
        path: 'login',
        title: 'Login',
        loadComponent: () => LoginComponent
      },
      {
        path: 'signup',
        title: 'Signup',
        loadComponent: () => SignupComponent
      },
      {
        path: 'forgot-password',
        title: 'Forgot password',
        loadComponent: () => ForgotPasswordComponent
      },
    ]
  }
]
