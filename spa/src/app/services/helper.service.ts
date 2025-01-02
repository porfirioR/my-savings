import { Injectable } from '@angular/core';
import { KeyValueViewModel } from '../models/view/key-value-view-model';
import { TypeApiModel } from '../models/api';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  public static convertToList = (elements: TypeApiModel[]): KeyValueViewModel[] => elements.map(x => new KeyValueViewModel(x.id, x.name))
}
