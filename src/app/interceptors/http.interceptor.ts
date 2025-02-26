import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenString = localStorage.getItem('user-details');
    let accessToken: string | null = null;

    if (tokenString) {
      try {
        const token = JSON.parse(tokenString); // Parse the string into an object
        accessToken = token.access_token;
      } catch (error) {
        console.error('Error parsing token from localStorage:', error);
      }
    }

    // Add the access token only to GET and POST requests
    if (accessToken && (request.method === 'GET' || request.method === 'POST' ||request.method==='PUT')) {
      const modifiedRequest = request.clone({
        setHeaders: {
          'access_token': accessToken,
        },
      });
      return next.handle(modifiedRequest); // Forward the modified request
    }

    return next.handle(request); // Forward other requests without changes
  }
}
