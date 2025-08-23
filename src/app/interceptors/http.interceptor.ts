import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Retrieve user & session info from localStorage
    const userString = localStorage.getItem('user-details');
    const sessionString = localStorage.getItem('session-info');

    let userId: string | null = null;
    let sessionId: string | null = null;

    try {
      if (userString) {
        const user = JSON.parse(userString);
        userId = user?.id || null;
      }
      if (sessionString) {
        const session = JSON.parse(sessionString);
        sessionId = session?.sessionId || null;
      }
    } catch (error) {
      console.error('Error parsing user/session from localStorage:', error);
    }

    // Always add withCredentials
    let modifiedRequest = request.clone({
      withCredentials: true
    });

    // If sessionId exists, attach it in headers
    if (sessionId) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'X-Session-Id': sessionId,
          'X-User-Id': userId || ''
        }
      });
    }

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Unauthorized (401) detected, logging out...');
          localStorage.removeItem('user-details');
          localStorage.removeItem('session-info');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
