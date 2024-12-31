import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { CreateSavingApiRequest, SavingApiModel, UpdateSavingApiRequest } from '../models/api'

@Injectable({
  providedIn: 'root'
})
export class SavingApiService {
  private url: string

  constructor(private readonly httpClient: HttpClient) {
    this.url = `${environment.baseUrl}savings`
  }

  public getMySavings = (authorId: number, id: number): Observable<SavingApiModel[]> => {
    return this.httpClient.get<SavingApiModel[]>(`${this.url}/${authorId}/${id}`)
  }

  public createSaving = (request: CreateSavingApiRequest): Observable<SavingApiModel> => {
    return this.httpClient.post<SavingApiModel>(this.url, request)
  }

  public updateSaving = (request: UpdateSavingApiRequest): Observable<SavingApiModel> => {
    return this.httpClient.put<SavingApiModel>(this.url, request)
  }

  //todo backend with full details of one specific saving
  public getMySaving = (id: number): Observable<SavingApiModel> => {
    return this.httpClient.get<SavingApiModel>(`${this.url}/${id}`)
  }
}
