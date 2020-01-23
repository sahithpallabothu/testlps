import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '@/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload(true);
            }
            
			
            if (err.status === 403) {
                return throwError("Unauthorized access!!!");
            }
			
			/*
			 console.log(" error.interceptor --- Line 20" + err);
			 for(var propName in err) {
				let propValue = err[propName]
				console.log(propName,propValue);
			}
			*/

            const error =   err.error.message || err.statusText || err.message;
            return throwError(error);
        }))
    }
}