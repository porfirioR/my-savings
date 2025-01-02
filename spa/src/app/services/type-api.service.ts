import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { TypeApiModel } from '../models/api'

@Injectable({
  providedIn: 'root'
})
export class TypeApiService {
  private url: string

  constructor(private readonly httpClient: HttpClient) {
    this.url = `${environment.baseUrl}type`
  }

  public getTypes = (): Observable<TypeApiModel[]> => {
    return this.httpClient.get<TypeApiModel[]>(`${this.url}`)
  }

}
