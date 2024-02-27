import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateEventApiRequest, EvenApiModel, UpdateEventApiRequest } from '../models/api';

@Injectable({
  providedIn: 'root'
})
export class EventApiService {
  private url: string

  constructor(private readonly httpClient: HttpClient) {
    this.url = `${environment.baseUrl}users`
  }

  public getPublicEvents = (): Observable<EvenApiModel[]> => {
    return this.httpClient.get<EvenApiModel[]>(`${this.url}`)
  }

  public getMyEvents = (id: number): Observable<EvenApiModel[]> => {
    return this.httpClient.get<EvenApiModel[]>(`${this.url}/${id}`)
  }

  public createEvent = (request: CreateEventApiRequest): Observable<EvenApiModel> => {
    return this.httpClient.post<EvenApiModel>(this.url, request)
  }

  public updateEvent = (request: UpdateEventApiRequest): Observable<EvenApiModel> => {
    return this.httpClient.post<EvenApiModel>(this.url, request)
  }

}
