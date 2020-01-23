import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '@/_services';
import { MessageConstants } from '@/shared/message-constants';



@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		console.log('in canActivate ' + route);
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {		
            this.authenticationService.isFooterActive.next(false);	
            this.authenticationService.illegalRouting.next(true);
			console.log('current user found, so going to next page ');
            // logged in so return true
            return true;
        }
        if(this.router.url.indexOf(MessageConstants.SUPERADMINLOGIN)!=-1){
            this.authenticationService.isFooterActive.next(true);	
            return true;
        }

		console.log('current user NOT found, so redirecting to login page  ');
        // not logged in so redirect to login page with the return url
        this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
        // this.router.navigate(['SuperAdminlogin'], { queryParams: { returnUrl: state.url } });
       // return false;
    }
}