import { Injectable } from '@angular/core';
import { KeyValueViewModel } from '../models/view/key-value-view-model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

constructor() { }
  public static convertToList = (elements: T[]): KeyValueViewModel[] => {
    return elements.map(x => new KeyValueViewModel(x.id, x.name))
  }
}
