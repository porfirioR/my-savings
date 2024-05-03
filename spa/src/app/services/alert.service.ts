import { Injectable } from '@angular/core'
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  public showQuestionModal = async (title: string, text: string = '', icon: SweetAlertIcon = 'warning'): Promise<SweetAlertResult<any>> => {
    const result = await Swal.fire({
      title,
      text,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        cancelButton: 'btn btn-outline btn-primary',
        confirmButton: 'btn btn-outline btn-primary'
      },
      buttonsStyling: false
    })
    return result
  }


  public showSuccess = (title: string = 'Successful operation'): void => {
    Swal.mixin({
      title,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: 'success',
      didOpen: (toast: any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    }).fire()
  }

  public showError = (text: string = ''): void => {
    Swal.fire({
      title: 'Unsuccessful operation',
      text,
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: {
        confirmButton: 'btn btn-outline btn-primary',
      },
      buttonsStyling: false,
    })
  }

  public showInfo = (text: string = ''): void => {
    Swal.fire({
      title: 'Information',
      text,
      icon: 'info',
      confirmButtonText: 'Ok',
      customClass: {
        confirmButton: 'btn btn-outline btn-primary',
      },
      buttonsStyling: false
    })
  }
}
