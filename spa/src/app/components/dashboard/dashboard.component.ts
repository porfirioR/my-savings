import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  toggleFloatingButtons() {
    const floatingButtons = document.getElementById('floatingButtons');
    if (floatingButtons) {
      floatingButtons.style.display = (floatingButtons.style.display === 'block') ? 'none' : 'block';

    }
  }
  
  handleAction(option: any) {
    alert(`Botón ${option} presionado`);
  }
}
