import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@/_services';
import {Constants} from '@/app.constants';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let currentUser = this.authenticationService.currentUserValue;
		/*
		if(currentUser !== undefined)
			console.log(" JwtInterceptor:intercept = " + currentUser.username + " --> " + currentUser.token);
		else
			console.log(" JwtInterceptor:intercept =  No Current user");
			*/
		
            if(Constants.SSO)
            {
                request = request.clone({
                        withCredentials: true
                     });
            }   
            else
            {
                if (currentUser && currentUser.token) {
                    request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${currentUser.token}`
                        }
                    });
                }
            } 

        return next.handle(request);
    }
}