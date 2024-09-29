import { Injectable, signal } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  // constructor(private dataService: DataService) {}
  // Define a signal that will hold the state
  private signalData = signal({}); // Initial value is false

  // Getter to expose the signal for reading
  get signalData$() {
    return this.signalData;
  }

  // Method to update the signal's value
  triggerAction(data:any) {
    this.signalData.set(data); // Set the signal to true (or any logic)
  }

  // Method to reset the signal if needed
  resetAction() {
    this.signalData.set({});
  }
}
