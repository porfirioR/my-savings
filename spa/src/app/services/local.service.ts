import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {
  private readonly emailKey = 'email'
  private readonly userKey = 'user'

  getEmail = (): string | null => localStorage.getItem(this.emailKey) ?? ''
  setEmail = (email: string): void => localStorage.setItem(this.emailKey, email)

  getUserId = (): number=> +(localStorage.getItem(this.emailKey) ?? -1)
  setUserId = (id: number): void => localStorage.setItem(this.userKey, id.toString())
}
