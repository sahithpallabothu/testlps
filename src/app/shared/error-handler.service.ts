import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
import { PopupMessageService } from './popup-message.service';
import { AuthenticationService } from '@/_services'; 
@Injectable({
  providedIn: 'root'
})

export class ErrorHandlerService {
	public errorMessage: string = '';
	public errorTitle: string = '';
	public Icon: string = '';
  constructor(private router: Router,  
              private popupService: PopupMessageService,
              private authenticationService: AuthenticationService) { }
 
  public handleError = (error: HttpErrorResponse) => {
    if(error.status === 500){
      this.handle500Error(error);
    }
    else if(error.status === 404){
      this.handle404Error(error)
    }
    else{
      this.handleOtherError(error);
    }
  }


  public IsValidUserSession()
  {
    this.authenticationService.currentUser.subscribe(user => {
      if(user === null)
       {
         this.router.navigate(['/login']);
       }   
      });
  }

  private handle500Error = (error: HttpErrorResponse) => 
  {
    this.createErrorMessage(error);
    this.router.navigate(['/500']);
  }
 
  private handle404Error = (error: HttpErrorResponse) => 
  {
    this.createErrorMessage(error);
    this.router.navigate(['/404']);
  }
 
  private handleOtherError = (error: HttpErrorResponse) => 
  {
	  console.log('in handleOtherError')
    this.createErrorMessage(error);
    //TODO: this will be fixed later;
  }
 
  private createErrorMessage(error: HttpErrorResponse)
  {
	 // console.log('in createErrorMessage')
	  this.errorMessage = error.error ? error.error : error.statusText;
	  
     if(this.errorMessage == null)
	   this.errorMessage  = error.toLocaleString();  
	   
	  this.errorTitle = "Error..";
	  this.Icon ="error";
	   this.popupService.openAlertDialog(this.errorMessage,this.errorTitle,this.Icon,false);	
  }
  
  public dispCustomErrorMessage = (msg : string) => 
  {
	   this.popupService.openAlertDialog(msg,this.errorTitle,this.Icon,false);	
  }
}