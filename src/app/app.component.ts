import { Component,ViewChild, ElementRef,AfterViewInit } from '@angular/core';
import {Constants} from '@/app.constants';
import { AuthenticationService } from '@/_services';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularCRUD';   
  isSideMenuLoaded : boolean = false;
  isReloadMenu : boolean = false;
  isFooterActive:boolean=Constants.SSO;
  userNotExist:boolean=true;
   
  constructor(private authenticationService: AuthenticationService) {   }
  ngOnInit(){

    const currentUser = this.authenticationService.currentUserValue;
    if(Constants.SSO){
      if (currentUser) {
        this.isFooterActive = false;
      }
    }
    this.authenticationService.isFooterActive.subscribe(isActive=>{
     this.isFooterActive = isActive;
     });
    }
    checkUserDetails(isUserLoggedin){
      this.userNotExist=!isUserLoggedin;
    }
  onSidenavMenusLoad() {  
      let  isSideMenuLoadedflag = (JSON.parse(sessionStorage.getItem('isSideMenuLoaded')) === undefined || JSON.parse(sessionStorage.getItem('isSideMenuLoaded'))=== null) ? false : true ;
     if(this.isSideMenuLoaded && isSideMenuLoadedflag === false) {    
         this.isSideMenuLoaded = false; 
         this.isReloadMenu = true;      
     }
     else if(!this.isSideMenuLoaded){        
       this.isSideMenuLoaded = true; 
       this.isReloadMenu=false;
       sessionStorage.setItem('isSideMenuLoaded', JSON.stringify(this.isSideMenuLoaded));     
     }        
  }

  onSideNavflagChange(menuFlag : boolean){
      // console.log('app component onSideNavflagChange() :: '+menuFlag);
   }
 
}
