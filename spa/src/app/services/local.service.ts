import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {
  private readonly emailKey = 'email'
  private readonly userKey = 'user'
  private readonly jwtToken = 'jwt'

  getEmail = (): string | null => localStorage.getItem(this.emailKey) ?? ''
  setEmail = (email: string): void => localStorage.setItem(this.emailKey, email)

  getUserId = (): number=> +(localStorage.getItem(this.userKey) ?? -1)
  setUserId = (id: number): void => localStorage.setItem(this.userKey, id.toString())

  getJwtToken = (): string | null => localStorage.getItem(this.jwtToken)
  setJwtToken = (token: string): void => localStorage.setItem(this.jwtToken, token)
}
