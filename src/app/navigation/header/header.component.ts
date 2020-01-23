import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AuthenticationService } from '@/_services';
import { User } from '@/businessclasses/admin/user';
import { Router } from '@angular/router';
import {ViewChild, ElementRef} from '@angular/core';
import { Observable } from 'rxjs';  
import { ErrorHandlerService } from '@/shared/error-handler.service';
import { PopupMessageService } from '@/shared/popup-message.service';
import { Constants } from '@/app.constants';
import { MessageConstants } from '@/shared/message-constants';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit  {
	
  @Output() public sidenavToggle = new EventEmitter();

  currentUser: User;
  showLogoutBtn :boolean =false;
  showMenu:boolean = false;
  isShow:string;

// Reference firstNameInput variable inside Component
@ViewChild('LoggedInUserName') LoggedInUserNameRef: ElementRef;
  
   
     constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService
    ) {
        
    }
 
  ngOnInit() {
			this.authenticationService.currentUser.subscribe(x => {
			this.currentUser = x;
			if(x !== null)
			{
				this.LoggedInUserNameRef.nativeElement.textContent = this.currentUser.firstName +" "+ this.currentUser.lastName;
				sessionStorage.setItem('currentUsername', this.LoggedInUserNameRef.nativeElement.textContent);
				sessionStorage.setItem('currentLoggedinUser', this.currentUser.userName);
			    this.showLogoutBtn =true;
				this.showMenu =true;
			}
			else{
			 this.showLogoutBtn =false;
			 //this.showMenu =true;
			}
				
			});

			this.authenticationService.illegalRouting.subscribe(isActive=>{
				this.showMenu =isActive;
				this.showLogoutBtn =isActive;
				this.LoggedInUserNameRef.nativeElement.textContent=isActive?this.LoggedInUserNameRef.nativeElement.textContent:'';
				if(Constants.SSO){
					if(!isActive){
						this.authenticationService.isFooterActive.next(true);	
						sessionStorage.removeItem('currentUser');
					}
				}
			});
  }
  
  
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
  
  async onLogout() {
	let confirmDialogText="Are you sure you want to logout?";
	
        console.log(" Trying to logout....");
	   if(Constants.SSO){
		await this.authenticationService.checkAdminExist();
		if(JSON.parse(sessionStorage.getItem('AdminExist'))==false){
			confirmDialogText=MessageConstants.ADMINNOTEXIST;
			}
	   }
        const userresponse1 = await this.popupService.openConfirmDialog(confirmDialogText,"help_outline",false);
		if(userresponse1 === "ok")
		{
			this.showMenu =false;
			this.showLogoutBtn =false;
			this.LoggedInUserNameRef.nativeElement.textContent = "Logged out";		 
			this.isShow = this.LoggedInUserNameRef.nativeElement.textContent;
			this.authenticationService.logout();
			
			localStorage.removeItem('searchCriteriaObj');
		
		}
    }
}
