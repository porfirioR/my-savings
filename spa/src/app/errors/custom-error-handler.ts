import { ErrorHandler, Injectable } from '@angular/core';
import { AlertService } from '../services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {
  constructor(private readonly alertService: AlertService) { }

  handleError(error: any): void {
    console.error(error);

    if (typeof error === 'string') {
      this.alertService.showError(error);
      return;
    } 
    
    if (error && error.error) {
      error = error.error;
      if (error && error.type === 'HandledError') {
        this.alertService.showError(`${error.status} - ${error.title}`);
      } else if (error && error.status) {
        let additionalMessage = '';
        if (error.errors) {
          for(const key in error.errors) {
            const child = error.errors[key];
            additionalMessage = `- ${child.join('. ')}`;
          }
        } else if (error.title) {
          additionalMessage = error.title
        } else if (error.message) {
          additionalMessage = error.message
        }
        this.alertService.showError(`${error.status} ${additionalMessage}`);
      }
    } else if (error.status === 403 || error.status === 401) {
      this.alertService.showError(`FORBIDDEN - ${error.message}`);
    } else {
      this.alertService.showError(`ERROR - ${JSON.stringify(error)}`)
    }
  }
}
