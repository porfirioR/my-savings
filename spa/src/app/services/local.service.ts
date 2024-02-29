import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {
  getEmail = (): string | null => localStorage.getItem('email') ?? ''
  setEmail = (email: string): void => localStorage.setItem('email', email)
}
