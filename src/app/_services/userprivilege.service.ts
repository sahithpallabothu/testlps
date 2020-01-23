import { Injectable } from '@angular/core';
 

@Injectable({ providedIn: 'root' })
export class UserPrivilegesService {
	
    constructor() {
        
    }
   private get validUserSession(): boolean {
         let currentLoginUser  : any = JSON.parse(sessionStorage.getItem('currentUser'));
          return (currentLoginUser != null) ? true : false;
   }

   public get getLoginUserPrivilegedScreens(): any {
     let currentUser : any = JSON.parse(sessionStorage.getItem('currentUser')); 
    	 return (currentUser != null && currentUser.rolePrivilegeslist.length > 0) ? currentUser.rolePrivilegeslist : [] ;
   }
    public  hasUserSessionExist(): boolean {
         return (this.validUserSession != null) ? true : false;
    }
    public  getLoginUser_CurrentScreenPrivileges(screenName : string): string {
        let currentUser  : any = JSON.parse(sessionStorage.getItem('currentUser'));
        let  screens : any = (currentUser != null && currentUser.rolePrivilegeslist.length > 0) ? 
                             currentUser.rolePrivilegeslist.filter(app => app.screenName.toLowerCase().trim().indexOf(screenName.toLowerCase().trim()) === 0)
                              : null;
          return ( screens != null && screens.length > 0 && screens[0].privilege != null) ? screens[0].privilege : null;               
    }
    
    public  hasDeleteScreenPrivileges(screenName : string): boolean {
         let privileges : string = this.getLoginUser_CurrentScreenPrivileges(screenName);
          return (privileges != null &&  privileges.search('D') !== -1) ? true : false ;
    }

   public  hasInsertScreenPrivileges(screenName : string): boolean { 
        let privileges : string = this.getLoginUser_CurrentScreenPrivileges(screenName);
         return (privileges != null && (privileges.search('I') !== -1)) ? true : false ;
   }
   public  hasReadScreenPrivileges(screenName : string): boolean { 
        let privileges : string = this.getLoginUser_CurrentScreenPrivileges(screenName);
          return (privileges != null && (privileges.search('R') !== -1)) ? true : false ;
    }
    public  hasUpdateScreenPrivileges(screenName : string): boolean {
         let privileges : string = this.getLoginUser_CurrentScreenPrivileges(screenName);
           return (privileges != null && privileges.search('U') !== -1) ? true : false ;
    }
     

     
}