import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    console.log('Fetching data -----', params); 
    return this.http.get<any[]>(this.customer, { params });
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

  updateCustomer(customer: any): Observable<any> {
    const url = this.apiUrl + '/customer';
    return this.http.post<any>(url + '/:id', customer);
  }

  saveLoan(loanData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, loanData);
  }
}