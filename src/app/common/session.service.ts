import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { API_URL } from '../../enviornments/version';  

@Injectable({ providedIn: 'root' })
export class SessionService {
  private pollingSub?: Subscription;
  private apiUrl = API_URL+'/auth';
  //http://localhost:3000/auth'; // adjust backend URL

  constructor(private http: HttpClient, private router: Router) {}

  startPollingSession() {
    // Poll every 60 seconds
    this.pollingSub = interval(120000).subscribe(() => {
      this.http.post(`${this.apiUrl}/refresh-session`, {}, { withCredentials: true })
        .subscribe({
          next: (res: any) => {
            console.log('Session refreshed:', res);
          },
          error: (err) => {
            if (err.status === 401) {
              console.warn('Session invalid -> logging out...');
              this.clearSessionAndRedirect();
            }
          }
        });
    });
  }
  

  stopPollingSession() {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
  }

  private clearSessionAndRedirect() {
    localStorage.removeItem('user-details');
    localStorage.removeItem('session-info');
    this.stopPollingSession();
    this.router.navigate(['/login']);
  }
}
