import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isLoadingEvent = new BehaviorSubject(false);

  constructor() {}

  showLoader() {
    this.isLoadingEvent.next(true);
  }

  hideLoader() {
    this.isLoadingEvent.next(false);
  }

  get isLoading$() {
    return this.isLoadingEvent.asObservable();
  }
}
