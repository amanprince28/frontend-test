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

  getCustomer(payload: any): Observable<any> {
    console.log('Fetching data -----'); 
    return this.http.get<any[]>(this.customer);
  }

  getCustomerById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.customer}/${id}`);
  }

  getCountry(countryId: string | null, name: string | null): Observable<any> {
    let url = this.apiUrl + '/country';
    const params = [];

    if (countryId) {
      params.push(`countryId=${countryId}`);
    }

    if (name) {
      params.push(`name=${name}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<any[]>(url);
  }

  addCustomer(customer: any): Observable<any> {
    const url = this.apiUrl + '/customer';
    return this.http.post<any>(url, customer);
  }
}