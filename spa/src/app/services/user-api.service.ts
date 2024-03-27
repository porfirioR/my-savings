import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserApiRequest, LoginUserApiRequest, SignApiModel, UserApiModel } from '../models/api';
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

  public signUpUser = (request: CreateUserApiRequest): Observable<SignApiModel> => {
    return this.httpClient.post<SignApiModel>(`${this.url}/sign-up`, request)
  }

  public loginUser = (request: LoginUserApiRequest): Observable<UserApiModel> => {
    return this.httpClient.post<UserApiModel>(`${this.url}/login`, request)
  }

  public getUserInformation = (userId: number): Observable<unknown> => {
    return this.httpClient.get<unknown>(`${this.url}/user-information/${userId}`)
  }

}
