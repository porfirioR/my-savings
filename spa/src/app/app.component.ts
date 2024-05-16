import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component'
import { HeaderComponent } from './components/header/header.component'
import { environment } from '../environments/environment.development'
import { SwPush } from '@angular/service-worker'
import { UserApiService } from './services'
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
    private readonly userApiService: UserApiService
  ) {
    this.key = environment.webPush.publicKey
    this.subscribeToNotification()
  }

  private subscribeToNotification = () => {
    this.swPush.requestSubscription({ serverPublicKey: this.key }).then(sub =>{
      const token: PushTokenApiRequest = JSON.parse(JSON.stringify(sub))
      this.userApiService.saveToken(token).subscribe()
    })
  }
}
