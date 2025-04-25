import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<string>();

  toast$ = this.toastSubject.asObservable();

  showToast(message: string): void {
    console.log('Toast message:', message);
    this.toastSubject.next(message);
  }
}
