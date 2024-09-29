import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignalService } from './signal.service'; // Hypothetical circular dependency

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000';
  private customer = this.apiUrl + '/customer';

  constructor(private http: HttpClient, private signalService: SignalService) {} // Circular dependency

  getElements(payload: any): Observable<any[]> {
    console.log('Fetching data -----');
    return this.http.get<any[]>(this.customer);
  }
}