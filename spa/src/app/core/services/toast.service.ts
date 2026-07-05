import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(text: string, duration = 3000): void {
    this.show(text, 'success', duration);
  }

  error(text: string, duration = 4000): void {
    this.show(text, 'error', duration);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(text: string, type: ToastMessage['type'], duration: number): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, text, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
