import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject,BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
//import { User } from '@/_models';
import { User } from '@/businessclasses/admin/User';
import {Constants} from '@/app.constants';
import { Router } from '@angular/router';

//import {HeaderComponent} from '@/navigation/header/header.component';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
	
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    public currentusername : string;
    public isFooterActive = new Subject<boolean>();
    public illegalRouting = new Subject<boolean>();

	 url = Constants.HOST_URL;
		
    //constructor(private http: HttpClient, private headerComponent:HeaderComponent) {
        constructor(private http: HttpClient,
            private router: Router) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string) {
        
      	console.log("Login called with "+username+" / ");
        
        //return this.http.post<any>(`${config.apiUrl}/users/authenticate`, { username, password })
		return this.http.post<any>(this.url +'/User/authenticate/', { username })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    //localStorage.setItem('currentUser', JSON.stringify(user));
                    sessionStorage.setItem('currentUser', JSON.stringify(user));					 
                    this.currentUserSubject.next(user);
                    this.isFooterActive.next(false);
                    this.illegalRouting.next(true);
                }

                // sessionStorage.setItem('currentUsername', username);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        //localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUsername');
        sessionStorage.removeItem('isSideMenuLoaded');
        sessionStorage.removeItem('UserLoggedIn');
        sessionStorage.removeItem('windowsUsername');
        sessionStorage.removeItem('AdminExist');
        this.illegalRouting.next(false);
        this.currentUserSubject.next(null);
        if(Constants.SSO){
            this.isFooterActive.next(true);
            if(sessionStorage.getItem('currentLoggedinUser')=='Admin'){
                sessionStorage.removeItem('currentLoggedinUser');
                this.router.navigate(['/SuperAdminLogin']);
            }
            else{
                this.router.navigate(['/login']);
            }
        }
        else{
            this.router.navigate(['/login']);
        }
       
    }

      // Gets the current logged in windows user name.
	 authenticateWindowsUser(): Observable<string> {

        // For winAuth
         return this.http.get(this.url+'/api/values', {responseType: 'text'});
    }
    //To check whether admin exist in db or not.
    checkAdminExist() {

        return new Promise(resolve => {
            let UserExist = this.http.get<any>(this.url + '/User/CheckAdminExist/');
            UserExist.subscribe(
                data => {
                    sessionStorage.setItem('AdminExist', JSON.stringify(data));
                    resolve();
                },
                error => {
                    console.log(error);
                }
                
            )
        })
    }
}