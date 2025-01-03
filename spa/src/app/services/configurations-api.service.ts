import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { TypeApiModel } from '../models/api'
import { Configurations } from '../models/enums'

@Injectable({
  providedIn: 'root'
})
export class ConfigurationApiService {
  private section: string = 'configurations'

  constructor(private readonly httpClient: HttpClient) { }

  public getTypes = (): Observable<TypeApiModel[]> =>
    this.httpClient.get<TypeApiModel[]>(`${this.section}/${Configurations.Types}`)

  public getPeriods = (): Observable<TypeApiModel[]> =>
    this.httpClient.get<TypeApiModel[]>(`${this.section}/${Configurations.Periods}`)

}
