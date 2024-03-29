import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserApiRequest, LoginUserApiRequest, SignApiModel, UserApiModel } from '../models/api';
import { environment } from '../../environments/environment';
import { LocalService } from './local.service';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private url: string

  constructor(
    private readonly httpClient: HttpClient,
    private readonly localService: LocalService
  ) {
    this.url = `${environment.baseUrl}users`
  }

  public getUsers = (): Observable<UserApiModel[]> => {
    return this.httpClient.get<UserApiModel[]>(`${this.url}`)
  }

  public getByUserId = (id: number): Observable<UserApiModel[]> => {
    return this.httpClient.get<UserApiModel[]>(`${this.url}/${id}`)
  }

  public signUpUser = (request: CreateUserApiRequest): Observable<SignApiModel> => {
    const httpHeader = new HttpHeaders();
    httpHeader.append('Content-Type', 'application/json')
    httpHeader.append("Authorization", "Basic " + btoa(`${request.email}:${request.password}`))

    const httpOptions = {
      headers: httpHeader
    };
    return this.httpClient.post<SignApiModel>(`${this.url}/sign-up`, request, httpOptions)
  }

  public loginUser = (request: LoginUserApiRequest): Observable<SignApiModel> => {
    return this.httpClient.post<SignApiModel>(`${this.url}/login`, request)
  }

  public getUserInformation = (userId: number): Observable<unknown> => {
    return this.httpClient.get<unknown>(`${this.url}/user-information/${userId}`)
  }

  private setInLocaleStorage = (user: SignApiModel): void => {
    this.localService.setEmail(user.email)
    this.localService.setJwtToken(user.token)
  }
}
