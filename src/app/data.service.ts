import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignalService } from './signal.service'; // Hypothetical circular dependency
import { API_URL } from '../enviornments/version';  

export interface AgentSalesReportRequest {
  agents: string[];
  fromDate: string; // ISO date string
  toDate: string;   // ISO date string
}

@Injectable({
  providedIn: 'root'
})

export class DataService {
  //private apiUrl ='https://www.cs-season.com/backend'
  //private apiUrl = 'https://cs-summer.com/api';
  //private apiUrl = 'http://47.129.250.145/api';
  //private apiUrl = 'http://localhost:3000';
  apiUrl = API_URL
  private customer = this.apiUrl + '/customer';
  private user = this.apiUrl + '/user';
  private loan = this.apiUrl + '/loan';


  constructor(private http: HttpClient, private signalService: SignalService) {} // Circular dependency

  getCustomer(payload: any): Observable<any> {
  const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());

  return this.http.get<any[]>(this.customer, {
    params
  });
}

logout(): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true });
}

  getLoan(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    
    return this.http.get<any[]>(this.loan, { params });
  }

  getLoanWithFilter(payload:any):Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString())
    .set('filter',payload.filter);
    
    return this.http.get<any[]>(this.loan, { params });
  }

  findCustomer(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString())
    .set('filter', payload.filter.toString());
    
    return this.http.get<any[]>(this.customer, { params });
  }

  getUser(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    
    return this.http.get<any[]>(this.user, { params });
  }

  getActiveUser(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('limit', payload.limit.toString());
    
    return this.http.get<any[]>(this.user+'/activeUser', { params });
  }

  getLoanStatusByPassport(passportNumber: string): Observable<any> {
    return this.http.get<any>(`${this.loan}/user-status/${passportNumber}`);
  }

  getSalesReport(agentName: string, dateFrom: string, dateTo: string): Observable<any> {
    const params: any = {};
    if (agentName) params.agentName = agentName;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    return this.http.get<any>(this.apiUrl, { params });
  }


  findUser(payload: any): Observable<any> {
    const params = new HttpParams()
    .set('page', payload.page.toString())
    .set('filter', payload.page.toString())
    .set('limit', payload.limit.toString());
    
    return this.http.get<any[]>(this.user, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.user}/${id}`);
  }

  getLeads(): Observable<any> {
    return this.http.get<any[]>(`${this.user+"/getLeads"}`);
  }

  getLeadsAdmiin(): Observable<any> {
    return this.http.get<any[]>(`${this.user+"/getAdminsAndLeads"}`);
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

  updatePayment(id: string, payload: any): Observable<any> {
    return this.http.put(`/payment/${id}`, payload);
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
    return this.http.post(`${this.apiUrl}/auth/login`, payload, {
      withCredentials: true
    });
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
    return this.http.put(`${this.apiUrl}/auth/change-password`, body); // Changed POST to PUT
  }

  fixProfitAll(): Observable<any>{
    return this.http.get<any[]>(this.loan+'/calculate-profits');
  }


  getReport(report_type: 'loan' | 'payment', fromDate?: string, toDate?: string,paymentFrom?:any,paymentTo?:any): Observable<any> {
    const url = this.apiUrl + '/report';
  
    const body: any = {
      report_type,
    };
  
    if (fromDate) {
      body.loan_date_from = fromDate;
    }
    if (toDate) {
      body.loan_date_to = toDate;
    }

    if (paymentFrom) {
      body.payment_date_from = paymentFrom;
    }
    if (paymentTo) {
      body.payment_date_to = paymentTo;
    }
  
    return this.http.post<any>(url, body);
  }

  getExpenses(agentIds: any, year: string): Observable<any> {
    const params = new URLSearchParams();
    params.set('agent_id',agentIds)
    params.set('year', year);
    return this.http.get(`${this.apiUrl}/expenses/current-year?${params.toString()}`);
  }
  

  saveExpenses(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/expenses`, payload);
  }  

  getLoanCheck(agents: any, fromDate: any, toDate: any,status:string,page:any,limit:any): Observable<any> {
    const payload = {
      agents,
      fromDate,status,
      toDate,page,limit
    };
  
    return this.http.post(`${this.apiUrl}/loan/getLoanCheck`, payload);
  }

  getAgentReports(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/agent-report-summary`, payload);
  }  

  getAgentPerformance(payload: AgentSalesReportRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/sales-report-summary`, payload);
  }

  getAgentsByLeads(leadIds: string[]): Observable<any[]> {
    return this.http.post<any[]>(this.user+'/agents-by-leads', { leadIds });
  }
  
  
}