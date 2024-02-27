import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserApiRequest, UserApiModel } from '../models/api';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private url: string

  constructor(private readonly httpClient: HttpClient) {
    this.url = `${environment.baseUrl}users`
  }

  public getUsers = (): Observable<UserApiModel[]> => {
    return this.httpClient.get<UserApiModel[]>(`${this.url}`)
  }

  public getByUserId = (id: number): Observable<UserApiModel[]> => {
    return this.httpClient.get<UserApiModel[]>(`${this.url}/${id}`)
  }

  public createUser = (email: string): Observable<UserApiModel> => {
    const request = new CreateUserApiRequest(email)
    return this.httpClient.post<UserApiModel>(this.url, request)
  }

}
