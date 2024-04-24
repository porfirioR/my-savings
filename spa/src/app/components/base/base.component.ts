import { Component } from '@angular/core';

@Component({
  selector: '',
  template: '',
  standalone: true
})
export class BaseComponent {
  public validClasses = 'focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 ';
  public invalidClasses = 'border-pink-500 border-pink-500 focus:border-pink-500 focus:ring-1 ring-pink-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500';
  public defaultClasses = `px-3 py-2 bg-white border shadow-sm
  border-slate-300 placeholder-slate-400
  disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
  focus:outline-none block w-full rounded-md sm:text-sm
  disabled:shadow-none`
}
