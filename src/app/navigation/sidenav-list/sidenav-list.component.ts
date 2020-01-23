import { Component, OnInit, Output, EventEmitter, Input,AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleScreenService } from 'app/businessservices/admin/roles.service';
  
import { AuthenticationService } from '@/_services';
import { Constants } from '@/app.constants';
 

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit,AfterViewInit {

  public sidenav_menus : Array<any> =[] ;
  public isSideNavflag : boolean = false;
  public selectedMenuItem : number = 0;
  defaultColor:string = '#256275'; //Menu Item default color
  highlightColor:string = '#31829b'; //Menu Item highlight color
   
  @Output() sidenavClose = new EventEmitter();
  @Input() 
       set isSideNavOnLoad(val :boolean){   
         this.selectedMenuItem = 0;
        let  isSideMenuLoadedflag = (JSON.parse(sessionStorage.getItem('isSideMenuLoaded'))!= undefined || JSON.parse(sessionStorage.getItem('isSideMenuLoaded'))!= null) ? true : false;
        if(val || isSideMenuLoadedflag === false){
               this.onSetDefaultMenu();              
          }         
        }
      get isSideNavOnLoad():boolean{        
        let  isSideMenuLoadedflag = (JSON.parse(sessionStorage.getItem('isSideMenuLoaded'))!= undefined || JSON.parse(sessionStorage.getItem('isSideMenuLoaded'))!= null) ? true : false;
        return isSideMenuLoadedflag;
      }

  constructor(private roleService:RoleScreenService, private route: ActivatedRoute,private router: Router, private authenticationService: AuthenticationService) {    
      
  }

  ngOnInit() {
    this.selectedMenuItem = 0;
        if(sessionStorage.getItem('currentUser')!=null && this.isSideNavOnLoad){
           this.onSetDefaultMenu();               
         }
  
  }
  ngAfterViewInit() {
    this.selectedMenuItem = 0;
    
  }

  //***************** SideNav Menu fuctionality ---[START]-------********//

  async onSetDefaultMenu(){
  
    let tempsidenavmenus : Array<any> = []; //local sidenavmenu array
    let sidenavMenusPrototype: Array<any> =this.getSidenavMenusPrototype(); //Get Sidenav Menus with SubMenus Prototype
    tempsidenavmenus.push({'id':1 ,'screenName':Constants.homeScreenName,'routerLink':'/home','icon':'home','isActive':true,'privilege':'','subMenus':[]});// Set sefault landing  screens as Home

    
    let currentUser : any = JSON.parse(sessionStorage.getItem('currentUser')); 
    if(currentUser != null && currentUser.rolePrivilegeslist.length > 0){ 
         sidenavMenusPrototype.forEach((currenntitem , index )=> {                
                       let mainindex : number = currentUser.rolePrivilegeslist.findIndex(function (item: any) {
                         let name = item.screenName.toLowerCase();
                          if((currenntitem.screenName.toLowerCase().trim() == Constants.postageScreenName.toLowerCase().trim()) && (name.trim() == Constants.fileAdjustmentScreenName.toLowerCase().trim()) )
                          {
                            return true; 
                          }
                          else
                          {
                          return name.includes(currenntitem.screenName.toLowerCase())  //currenntitem.screenName.toLowerCase().trim();                
                          }
                        });

                          if(mainindex != -1 ){                                                
                              let privileges : string = currentUser.rolePrivilegeslist[mainindex].privilege!= null ? currentUser.rolePrivilegeslist[mainindex].privilege : null; 
                              sidenavMenusPrototype[index].privilege = privileges; 
                               //set Active Main menus   
                               sidenavMenusPrototype[index].isActive = true; 
                                
                              //for change printlocation
                              if(Constants.changePrintLocationScreenName.toLowerCase().trim() === currenntitem.screenName.toLowerCase().trim()) {
                                if(privileges != null && (privileges.search('R') !== -1 )){ 
                                    sidenavMenusPrototype[index].isActive = true; 
                                }else{
                                    sidenavMenusPrototype[index].isActive = false; 
                                }
                              }  
                               
                              //set Active Sub menus
                              if(!(currenntitem.screenName.toLowerCase().trim() === Constants.adminScreenName.toLowerCase().trim())){ 
                             
                              if(sidenavMenusPrototype[index].subMenus.length > 0) {
                                let tempSubmenus  = sidenavMenusPrototype[index].subMenus;
                                if(privileges != null && (privileges.search('R') !== -1 || privileges.search('U') !== -1 || privileges.search('I') !== -1)|| privileges.search('D') !== -1){
                                                                                   
                                  switch(currenntitem.screenName.toLowerCase().trim()){
                                                      
                                      case Constants.customerScreenName.toLowerCase().trim() :
                                             if(privileges.search('I') !== -1){
                                                let  addindex : number = tempSubmenus.findIndex(function (item: any) {
                                                    return item.screenName.toLowerCase().trim() === Constants.AddCustomerSubmenu.toLowerCase().trim();                
                                                  });
                                                 if(addindex != -1){
                                                   sidenavMenusPrototype[index].subMenus[addindex].isActive=true;
                                                 }
                                             }
                                             if(privileges.search('R') !== -1 || privileges.search('U') !== -1 ){
                                                let  ruindex : number = tempSubmenus.findIndex(function (item: any) {
                                                  return item.screenName.toLowerCase().trim() === Constants.ViewEditCustomerSubmenu.toLowerCase().trim();                
                                                 });

                                                 if(ruindex != -1){
                                                    sidenavMenusPrototype[index].subMenus[ruindex].isActive=true;
                                                 }
                                              }
                                              if(privileges.search('U') !== -1 ){
                                                let  ruindex : number = tempSubmenus.findIndex(function (item: any) {
                                                  return item.screenName.toLowerCase().trim() === Constants.ViewEditCustomerSubmenu.toLowerCase().trim();                
                                                 });

                                                 if(ruindex != -1){
                                                    sidenavMenusPrototype[index].subMenus[ruindex].isActive=true;
                                                 }
                                              }
                                        break;

                                        case Constants.applicationScreenName.toLowerCase().trim() :
                                            if(privileges.search('I') !== -1){
                                              let  addindex : number = tempSubmenus.findIndex(function (item: any) {
                                                  return item.screenName.toLowerCase().trim() === Constants.AddApplicationSubmenu.toLowerCase().trim();                
                                                });
                                               if(addindex != -1){
                                                 sidenavMenusPrototype[index].subMenus[addindex].isActive=true;
                                               }
                                           }
                                           if(privileges.search('R') !== -1 || privileges.search('U') !== -1 ){
                                              let  ruindex : number = tempSubmenus.findIndex(function (item: any) {
                                                return item.screenName.toLowerCase().trim() === Constants.ViewEditApplicationSubmenu.toLowerCase().trim();                
                                               });

                                               if(ruindex != -1){
                                                 sidenavMenusPrototype[index].subMenus[ruindex].isActive=true;
                                               }
                                            }
                                        break;

                                        case Constants.insertsScreenName.toLowerCase().trim() :
                                            if(privileges.search('I') !== -1){
                                              let  addindex : number = tempSubmenus.findIndex(function (item: any) {
                                                  return item.screenName.toLowerCase().trim() === Constants.AddInsertSubmenu.toLowerCase().trim();                
                                                });
                                               if(addindex != -1){
                                                 sidenavMenusPrototype[index].subMenus[addindex].isActive=true;
                                               }
                                           }
                                         
                                           if(privileges.search('D') !== -1 || privileges.search('U') !== -1 || privileges.search('R') !== -1 ){
                                              let  ruindex : number = tempSubmenus.findIndex(function (item: any) {
                                                return item.screenName.toLowerCase().trim() === Constants.ViewEditInsertSubmenu.toLowerCase().trim();                
                                               });
                                              
                                             
                                               if(ruindex != -1){
                                                  sidenavMenusPrototype[index].subMenus[ruindex].isActive=true;
                                               }
                                            }
                                        break;

                                        case Constants.additionalChargesScreenName.toLowerCase().trim() :
                                          if(privileges.search('I') !== -1){
                                            let  addindex : number = tempSubmenus.findIndex(function (item: any) {
                                                return item.screenName.toLowerCase().trim() === Constants.AddAddlChargesSubmenu.toLowerCase().trim();                
                                              });
                                             if(addindex != -1){
                                               sidenavMenusPrototype[index].subMenus[addindex].isActive=true;
                                             }
                                         }
                                       
                                         if(privileges.search('D') !== -1 || privileges.search('U') !== -1 || privileges.search('R') !== -1 ){
                                            let  ruindex : number = tempSubmenus.findIndex(function (item: any) {
                                              return item.screenName.toLowerCase().trim() === Constants.ViewEditAddlChargesSubmenu.toLowerCase().trim();                
                                             });
                                            
                                           
                                             if(ruindex != -1){
                                                sidenavMenusPrototype[index].subMenus[ruindex].isActive=true;
                                             }
                                          }
                                      break;                                              
                                  }
                              }
                             }
                            }

                            //if(index ==0)
                            //{
                            // sidenavMenusPrototype[index].screenName = 'File Counts';
                            //}
                            
                              tempsidenavmenus.push(sidenavMenusPrototype[index]);                             
                            
                           }
                     });                                                                                                                
     }
     else{
        //If user sessions out
         this.logOut();   
     }
     
     this._getSortedSidenavMenus(tempsidenavmenus);  
 
  }

//Get Side Nav Menus with submenus Prototype 
 /*  private getSidenavMenusPrototype() : Array<any>  {
      let  sidenavMenusPrototype : Array<any> = [ 
            {'id':2 ,'screenName':'Postage','routerLink':'/update_postages','icon':'local_shipping','isActive':false,'privilege':'','subMenus':[]} ,//{ 'screenName':'View / Edit Postage','routerLink':'/update_postages'},{'screenName':'Get Postal Reports','routerLink':'/postal_reports'}
            {'id':3 ,'screenName':'Inserts','routerLink':'','icon':'insert_link','isActive':false,'privilege':'','subMenus':[{'screenName':'Add Insert','routerLink':'/add_insert','isActive':false,}, {'screenName':'View /Edit Insert','routerLink':'/view_insert','isActive':false,},]} ,
            {'id':4 ,'screenName':'Running Summary','routerLink':'/runningsummary','icon':'dvr','isActive':false,'privilege':'','subMenus':[]} ,
            {'id':5 ,'screenName':'Reports','routerLink':'/reports','icon':'description','isActive':false,'privilege':'','subMenus':[]},
            {'id':9 ,'screenName':'Customer','routerLink':'','icon':'perm_identity','isActive':false,'privilege':'','subMenus':[{'screenName':'Add Customer','routerLink':'/add_customer','isActive':false,}, {'screenName':'View / Edit Customer','routerLink':'/view_customer','isActive':false,}]},
            {'id':10 ,'screenName':'Application','routerLink':'','icon':'phone_iphone','isActive':false,'privilege':'','subMenus':[{'screenName':'Add Application','routerLink':'/add_application','isActive':false,}, {'screenName':'View / Edit Application','routerLink':'/view_application','isActive':false,}]},  //, {'screenName':'Change Print Location','routerLink':'/print_location'}
            {'id':11 ,'screenName':'Change Print Location','routerLink':'/print_location','icon':'place','isActive':false,'privilege':'','subMenus':[]} ,  
            {'id':12 ,'screenName':'Admin Screens','routerLink':'','icon':'settings','isActive':false,'privilege':'',
            'subMenus':[{'screenName':'App Type','routerLink':'/admin_apptype','isActive':true,},             
                        {'screenName':'Department','routerLink':'/admin_department','isActive':true,},
                        {'screenName':'Fee Description','routerLink':'/admin_feedescription','isActive':true,},
                        {'screenName':'Flag','routerLink':'/admin_flag','isActive':true,},
                        {'screenName':'Groups','routerLink':'/admin_groups','isActive':true,},
                        {'screenName':'Postcard Postage Rates','routerLink':'/admin_pcardrates','isActive':true,},
                        {'screenName':'Perforation Patterns','routerLink':'/admin_perfpatterns','isActive':true,},
                        {'screenName':'Statement Postage Order','routerLink':'/admin_postageorder','isActive':true,},
                        {'screenName':'First Class Postage Rates','routerLink':'/admin_prates','isActive':true,},
                        {'screenName':'Rate Description','routerLink':'/admin_rateDescription','isActive':true,},
                        {'screenName':'Roles','routerLink':'/admin_roles','isActive':true,},
                        {'screenName':'Statement Run Type Order','routerLink':'/admin_runtypeorder','isActive':true,},
                        {'screenName':'Shipment Method','routerLink':'/admin_shipmentmethod','isActive':true,},
                        {'screenName':'Size','routerLink':'/admin_size','isActive':true,},
                        {'screenName':'States','routerLink':'/admin_states','isActive':true,},
                        {'screenName':'Users','routerLink':'/admin_users','isActive':true,}
                      ],        
            },
            {'id':13,'screenName':'Additional Charges','routerLink':'/additional_charges','icon':'attach_money','isActive':false,'privilege':'','subMenus':[]} 
        ];

    return sidenavMenusPrototype;
  }

   */

  private getSidenavMenusPrototype() : Array<any>  {
   
    let  sidenavMenusPrototype : Array<any> = [ 
        {'id':2 ,'screenName':Constants.postageScreenName,'routerLink':'/update_postages','icon':'local_shipping','isActive':false,'privilege':'','subMenus':[]} ,//{ 'screenName':'View / Edit Postage','routerLink':'/update_postages'},{'screenName':'Get Postal Reports','routerLink':'/postal_reports'}
        {'id':3 ,'screenName':'Inserts','routerLink':'','icon':'insert_link','isActive':false,'privilege':'','subMenus':[{'screenName':'Add Inserts','routerLink':'/add_insert','isActive':false,}, {'screenName':'View /Edit Inserts','routerLink':'/view_insert','isActive':false,},]} ,
        {'id':4 ,'screenName':Constants.runningSummaryScreenName,'routerLink':'/runningsummary','icon':'dvr','isActive':false,'privilege':'','subMenus':[]} ,
        {'id':5 ,'screenName':Constants.reportsScreenName,'routerLink':'/reports','icon':'description','isActive':false,'privilege':'','subMenus':[]},
        {'id':6 ,'screenName':Constants.customerScreenName,'routerLink':'','icon':'perm_identity','isActive':false,'privilege':'','subMenus':[{'screenName':Constants.AddCustomerSubmenu,'routerLink':'/add_customer','isActive':false,}, {'screenName':Constants.ViewEditCustomerSubmenu,'routerLink':'/view_customer','isActive':false,}]},
        {'id':7 ,'screenName':Constants.applicationScreenName,'routerLink':'','icon':'phone_iphone','isActive':false,'privilege':'','subMenus':[{'screenName':Constants.AddApplicationSubmenu,'routerLink':'/add_application','isActive':false,}, {'screenName':Constants.ViewEditApplicationSubmenu,'routerLink':'/view_application','isActive':false,}]},  //, {'screenName':'Change Print Location','routerLink':'/print_location'}
        {'id':8 ,'screenName':Constants.changePrintLocationScreenName,'routerLink':'/print_location','icon':'place','isActive':false,'privilege':'','subMenus':[]} ,  
        {'id':9 ,'screenName':Constants.adminScreenName,'routerLink':'','icon':'settings','isActive':false,'privilege':'',
        'subMenus':[{'screenName':Constants.appTypeSubmenu,'routerLink':'/admin_apptype','isActive':true,},             
                    {'screenName':Constants.departmentSubmenu,'routerLink':'/admin_department','isActive':true,},
                    {'screenName':Constants.feeDescriptionSubmenu,'routerLink':'/admin_feedescription','isActive':true,},
                    {'screenName':Constants.flagSubmenu,'routerLink':'/admin_flag','isActive':true,},
                    // {'screenName':Constants.groupsSubmenu,'routerLink':'','isActive':true,},
                    // {'screenName':Constants.postcardPostageRatesSubmenu,'routerLink':'','isActive':true,},
                    {'screenName':Constants.perforationPatternsSubmenu,'routerLink':'/admin_perfpatterns','isActive':true,},
                    {'screenName':Constants.PostageRatesSubmenu,'routerLink':'/admin_prates','isActive':true,},
                    
                    // {'screenName':Constants.statementPostageOrderSubmenu,'routerLink':'','isActive':true,},
                    // {'screenName':Constants.firstClassPostageRatesSubmenu,'routerLink':'','isActive':true,},
                    {'screenName':Constants.rateDescriptionSubmenu,'routerLink':'/admin_ratedescription','isActive':true,},
                    {'screenName':Constants.rolesSubmenu,'routerLink':'/admin_roles','isActive':true,},
                    // {'screenName':Constants.statementRunTypeOrderSubmenu,'routerLink':'','isActive':true,},
                    {'screenName':Constants.shipmentMethodSubmenu,'routerLink':'/admin_shipmentmethod','isActive':true,},
                    {'screenName':Constants.sizeSubmenu,'routerLink':'/admin_size','isActive':true,},
                    {'screenName':Constants.softwaresunmenu,'routerLink':'/admin_software','isActive':true,},
                    {'screenName':Constants.statesSubmenu,'routerLink':'/admin_states','isActive':true,},
                    {'screenName':Constants.usersSubmenu ,'routerLink':'/admin_users','isActive':true,},
                  ],        
        },
        {'id':10 ,'screenName':Constants.additionalChargesScreenName,'routerLink':'','icon':'attach_money','isActive':false,'privilege':'','subMenus':[{'screenName':Constants.AddAddlChargesSubmenu,'routerLink':'/additional_charges','isActive':false,}, {'screenName':Constants.ViewEditAddlChargesSubmenu,'routerLink':'/view_additional_charges','isActive':false,},]} ,
        {'id':11 ,'screenName':Constants.fileAdjustmentScreenName,'routerLink':'/file_adjustment','icon':'assignment','isActive':false,'privilege':'','subMenus':[]} ,
    ];

  return sidenavMenusPrototype;
}

  private logOut(){
    this.authenticationService.logout();
    localStorage.removeItem('isSideNavflag');
   
    sessionStorage.removeItem('isSideMenuLoaded');
    this.router.navigate(['/login']); 
    
  }

  public onSelectedMenuItem(id): void { 
    this.selectedMenuItem = id;  
 }
 
 public onSidenavClose = (id:any) => {
  
  localStorage.removeItem('homeData');
   if(id===11){
     localStorage.setItem("InPrintLocaton","Entered")
   } 
   if(id==Constants.printLocationFlag){
    localStorage.setItem("InPrintLocaton","Entered");
   }
   if(id===Constants.FromMenusInsertsNavFlag){
      localStorage.removeItem('arrayList');
      localStorage.removeItem('viewInsertsData');
      localStorage.removeItem('backToViewInserts');
      localStorage.removeItem("custCodeForEditInsert")
      localStorage.removeItem('startDateForEditInsert')
      localStorage.removeItem('endDateForEditInsert')
   }
   if(id==Constants.FromApplicationNavFlag){
    localStorage.removeItem('selectedItem');
    localStorage.removeItem('applicationArray');
    localStorage.removeItem('searchText');
    localStorage.removeItem('clickedRow');
 }
   this.selectedMenuItem = 0;
   this.sidenavClose.emit();
   
 }

 private _getSortedSidenavMenus(tempsidenavmenus:Array<any>) {
  this.sidenav_menus=[];
  tempsidenavmenus.sort((a,b) => (a.screenName > b.screenName) ? 1 : ((b.screenName > a.screenName) ? -1 : 0)); 
  this.sidenav_menus = tempsidenavmenus;
}

//*****************SideNav Menu fuctionality ---[END]--------********//
 
}
