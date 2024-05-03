import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component'
import { HeaderComponent } from './components/header/header.component'

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
}
