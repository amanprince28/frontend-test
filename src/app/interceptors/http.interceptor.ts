import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
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

    // If sessionId exists, attach it in headers (optional but useful for debugging or hybrid auth)
    if (sessionId) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'X-Session-Id': sessionId,
          'X-User-Id': userId || ''
        }
      });
    }

    return next.handle(modifiedRequest);
  }
}
