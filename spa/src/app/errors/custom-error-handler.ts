import { ErrorHandler, Injectable } from '@angular/core'
import { AlertService, LocalService } from '../services'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {
  constructor(
    private readonly alertService: AlertService,
    private readonly localService: LocalService,
    private readonly router: Router
  ) { }

  handleError(error: any): void {
    console.error(error)

    if (typeof error === 'string') {
      this.alertService.showError(error)
      return
    } 

    if (error && error.error) {
      error = error.error
      if (error && error.type === 'HandledError') {
        this.alertService.showError(`${error.status} - ${error.title}`)
      } else if (error && error.status) {
        let additionalMessage = ''
        if (error.errors) {
          for(const key in error.errors) {
            const child = error.errors[key]
            additionalMessage = `- ${child.join('. ')}`
          }
        } else if (error.title) {
          additionalMessage = error.title
        } else if (error.message) {
          if (error.message === 'jwt expired') {
            this.localService.cleanCredentials()
            this.alertService.showError(`${error.status} ${additionalMessage}`)
            this.router.navigate(['login'])
          }
          additionalMessage = error.message
        }
        this.alertService.showError(`${error.status} ${additionalMessage}`)
      }
    } else if (error.status === 403 || error.status === 401) {
      this.alertService.showError(`FORBIDDEN - ${error.message}`)
    } else {
      this.alertService.showError(`ERROR - ${JSON.stringify(error)}`)
    }
  }
}
