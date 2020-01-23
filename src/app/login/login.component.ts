import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

//import { AuthenticationService } from '@/_services';
import { AlertService, AuthenticationService } from '@/_services';
import { MessageConstants } from '@/shared/message-constants';
import {Constants} from '@/app.constants';
 
@Component({
  selector: 'login-selector',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
	
	  
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    hideSpinner= false;
    spinnerText = MessageConstants.SPINNERTEXT;
    //inValidUser : boolean = false;
	//to set foucs 
	@ViewChild('UserId') userIdInput:  ElementRef;
	
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
		private alertService: AlertService
    ) {
	}

    ngOnInit() {
        
        this.authenticationService.illegalRouting.next(false);
		this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
           // password: ['123', Validators.required]
        });

		//set the focus on userId
		this.userIdInput.nativeElement.focus();
		
        // reset login status
     //   this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        
        if(Constants.SSO){
           
            if (sessionStorage.getItem('windowsUsername') != null) {
                if(this.router.url.indexOf(MessageConstants.SUPERADMINLOGIN)==-1){
                    this.loginForm.controls['username'].setValue(sessionStorage.getItem('windowsUsername'));
                    this.hideSpinner=true;
                    this.onSubmit();
                    sessionStorage.removeItem('windowsUsername');
                }
                else{
                   // this.loginForm.controls['username'].setValue(MessageConstants.ADMINNAME);
                }
               
            } else {
                if(this.router.url.indexOf(MessageConstants.SUPERADMINLOGIN)==-1){
                    this.hideSpinner=true;
                    this.AuthenticateUser();
                }
                else{
                   // this.loginForm.controls['username'].setValue(MessageConstants.ADMINNAME)
                }
                
            }
        }
      
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }
    
    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        if(Constants.SSO){
            if(this.router.url.indexOf(MessageConstants.SUPERADMINLOGIN)!=-1){
                let uname:string=this.loginForm.controls['username'].value;
                if(uname.toLowerCase()!=MessageConstants.ADMINNAME.toLowerCase()){
                    this.alertService.error("Access denied.");
                    return;
                }
                this.checkAdminExist();
            }
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                    this.hideSpinner=false;
                },
                error => {
                    console.log( error );
                    console.log("authentication service - authentication failed - id/pass problem ???");
                    this.hideSpinner=false;
                    this.router.navigate(['401']);
					if(error.error){
                        this.alertService.error(error.error);
                    }						
					else{
                        this.alertService.error(error);
                     
                    } 						
						
                    this.loading = false;
                });
    }

      
    //To check whether admin exist in db.
    async checkAdminExist() {
        await this.authenticationService.checkAdminExist();

        if(this.router.url.indexOf(MessageConstants.SUPERADMINLOGIN)==-1){
            if (sessionStorage.getItem('windowsUsername') != null && sessionStorage.getItem('windowsUsername')== this.loginForm.controls['username'].value) {
            
                this.onSubmit();
            }
            else{
                this.hideSpinner=false;
                  this.router.navigate(['401']);
            }
    
        }
               
    }
      // To authenticate the windows logged in user.
      AuthenticateUser() {
        this.authenticationService.authenticateWindowsUser()
            //  .pipe(first())
            .subscribe(
                data => {
                    console.log(data);
                    console.log(data.split("\\")[1]);
                    if (data != null) {
                        this.loginForm.controls['username'].setValue(data.split("\\")[1]);
                        sessionStorage.setItem('windowsUsername',data.split("\\")[1]);
                        this.checkAdminExist();
                    }
                    else {
                          this.router.navigate(['401']);
                    }

                },
                error => {
                    console.log('', error);
                    this.router.navigate(['401']);
                    console.log("authentication service - authentication failed - id/pass problem ???");
                    if (error.error)
                        this.alertService.error(error.error);
                    else
                        this.alertService.error(error);
                });

    }


}
