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
  private user = this.apiUrl + '/user';
  private loan = this.apiUrl + '/loan';


  constructor(private http: HttpClient, private signalService: SignalService) {} // Circular dependency

  getCustomer(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    console.log('Fetching data -----', params); 
    return this.http.get<any[]>(this.customer, { params });
  }

  getLoan(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    console.log('Fetching data -----', params); 
    return this.http.get<any[]>(this.loan, { params });
  }


  findCustomer(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString())
    .set('filter', payload.filter.toString());
    console.log('Fetching data -----', params); 
    return this.http.get<any[]>(this.customer, { params });
  }

  getUser(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    console.log('Fetching data -----', params); 
    return this.http.get<any[]>(this.user, { params });
  }

  getLoanStatusByPassport(passportNumber: string): Observable<any> {
    return this.http.get<any>(`${this.loan}/user-status/${passportNumber}`);
  }


  findUser(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('filter', payload.page.toString())
    .set('limit', payload.limit.toString());
    console.log('Fetching data -----', params); 
    return this.http.get<any[]>(this.user, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.user}/${id}`);
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

  addUser(customer: any): Observable<any> {
    const url = this.apiUrl + '/user';
    return this.http.post<any>(url, customer);
  }

  addLoan(loan: any): Observable<any> {
    const url = this.apiUrl + '/loan';
    return this.http.post<any>(url, loan);
  }

  updateLoan(id: string, loanData: any): Observable<any> {
    const url = this.apiUrl + '/loan';
    return this.http.put(`${url}/${id}`, loanData);
  }

  addPayment(payment: any): Observable<any> {
    const url = this.apiUrl + '/payment';
    return this.http.post<any>(url, payment);
  }

  getPaymentByLoanId(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/payment/get-by-loan/${id}`);
  }

  updateInstallment(id: string, updateLoanDto: any): Observable<any> {
    return this.http.put(`${this.loan}/installment/${id}`, updateLoanDto);
  }

  getLoanById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/loan/${id}`);
  }


  updateUser(user: any): Observable<any> {
    const url = this.apiUrl + '/user';
    const userId = user.id;
    const updateUrl = `${url}/${userId}`;
    return this.http.put<any>(updateUrl, user);
  }
  
  updateCustomer(id: string, updateCustomerDto: any): Observable<any> {
    const url = `${this.apiUrl}/customer/${id}`; 
    return this.http.put(url, updateCustomerDto); 
  }

  saveLoan(loanData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, loanData);
  }

  uploadFiles(payload:any):Observable<any>{
    return this.http.post(`${this.apiUrl}/customer/add-document`, payload);
  }

  login(payload:any):Observable<any>{
    return this.http.post(`${this.apiUrl}/auth/login`, payload);
  }

  getCustomerById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.customer}/${id}`);
  }

  getDocumentById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/customer/getDocument/${id}`);
  }

  getCustomerSearch(payload: any): Observable<any> {
    const url = `${this.customer}/getCustomer/${payload}`;
    return this.http.get<any>(url);
  }
  
  findAgentAndLeads(payload: any): Observable<any> {
    const url = `${this.user}/getAgentAndLeads/${payload}`;
    return this.http.get<any>(url);
  }

  deleteUser(id: string): Observable<any> {
    const url = `${this.user}/${id}`;
    return this.http.delete<any>(url);
  }

  deleteLoan(id: string): Observable<any> {
    const url = `${this.loan}/${id}`;
    return this.http.delete<any>(url);
  }

  deleteCustomer(id: string): Observable<any> {
    const url = `${this.customer}/${id}`;
    return this.http.delete<any>(url);
  }


  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const body = { currentPassword, newPassword };
    return this.http.put(`${this.user}/change-password`, body); // Changed POST to PUT
  }


}