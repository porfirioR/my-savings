import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { SwPush } from '@angular/service-worker'
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component'
import { HeaderComponent } from './components/header/header.component'
import { environment } from '../environments/environment.development'
import { LocalService, UserApiService } from './services'
import { PushTokenApiRequest } from './models/api'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    DynamicTableComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private key: string

  constructor(
    private swPush: SwPush,
    private readonly userApiService: UserApiService,
    private readonly localService: LocalService
  ) {
    this.key = environment.webPush.publicKey
    this.subscribeToNotification()
  }

  private subscribeToNotification = (): void => {
    const email = this.localService.getEmail()
    if (email && environment.production) {
      this.swPush.requestSubscription({ serverPublicKey: this.key }).then(sub =>{
        const token: PushTokenApiRequest = JSON.parse(JSON.stringify(sub))
        token.email = email
        this.userApiService.saveToken(token).subscribe()
      }).catch(reason => {
        console.error(reason)
      })
    }
  }
}
