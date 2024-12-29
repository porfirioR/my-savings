import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { CreateSavingApiRequest, EvenApiModel, UpdateSavingApiRequest } from '../models/api'

@Injectable({
  providedIn: 'root'
})
export class SavingApiService {
  private url: string

  constructor(private readonly httpClient: HttpClient) {
    this.url = `${environment.baseUrl}savings`
  }

  public getMySavings = (authorId: number, id: number): Observable<EvenApiModel[]> => {
    return this.httpClient.get<EvenApiModel[]>(`${this.url}/${authorId}/${id}`)
  }

  public createSaving = (request: CreateSavingApiRequest): Observable<EvenApiModel> => {
    return this.httpClient.post<EvenApiModel>(this.url, request)
  }

  public updateSaving = (request: UpdateSavingApiRequest): Observable<EvenApiModel> => {
    return this.httpClient.put<EvenApiModel>(this.url, request)
  }

  //todo backend with full details of one specific saving
  public getMySaving = (id: number): Observable<EvenApiModel> => {
    return this.httpClient.get<EvenApiModel>(`${this.url}/${id}`)
  }
}
