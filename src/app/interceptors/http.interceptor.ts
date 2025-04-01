import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()

export class HttpInterceptorService implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenString = localStorage.getItem('user-details');
    let accessToken: string | null = null;
    let userid: string | null = null;
    
    if (tokenString) {
      try {
        const token = JSON.parse(tokenString);
        accessToken = token.access_token;
        userid = token.id;
      } catch (error) {
        console.error('Error parsing token from localStorage:', error);
      }
    }

    // Add the access token to headers for GET, POST, and PUT requests
    if (accessToken && (request.method === 'GET' || request.method === 'POST' || request.method === 'PUT')) {
      let modifiedRequest = request.clone({
        setHeaders: {
          'access_token': accessToken,
          'user_id': userid || ''
        }
      });

      // For POST and PUT requests, add userid to the body if it exists
      if ((request.method === 'POST' || request.method === 'PUT') && userid) {
        const body = request.body ? { ...request.body, userid } : { userid };
        modifiedRequest = modifiedRequest.clone({ body });
      }

      // For GET requests, add userid to the query params if it exists
      if (request.method === 'GET' && userid) {
        modifiedRequest = modifiedRequest.clone({
          params: request.params.set('userid', userid)
        });
      }

      return next.handle(modifiedRequest);
    }

    return next.handle(request);
  }
}
