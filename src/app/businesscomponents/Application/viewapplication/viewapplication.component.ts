import { Component, OnInit,ViewChild } from '@angular/core';  
import { Observable } from 'rxjs';  
import {FormBuilder} from '@angular/forms';  
import {MatSort, MatTableDataSource} from '@angular/material';
import { Application } from '../../../businessclasses/application/application';  
import { ApplicationService } from '../../../businessservices/application/application.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import {Router} from '@angular/router';
import { MessageConstants } from '@/shared/message-constants';
import { CustomerService } from '@/businessservices/customer/customer.service';
import { Customer } from '@/businessclasses/Customer/customer';
import { Constants } from '@/app.constants';
import { UserPrivilegesService } from '@/_services';
@Component({
 selector: 'app-viewapplication',
  templateUrl: './viewapplication.component.html',
  styleUrls: ['./viewapplication.component.css']
})
export class ViewapplicationComponent implements OnInit {

  custableColumns  :  string[] = ['applicationName',
                                'applicationCode',
                                'customerName',
								                'customerCode',
                                'customerState',
                                'customerFlag',
                                'appType',
                                'software',
                                'perfPatternDescription',
                                'runFrequencyName'
                               ];
    obj_RunFrequency={
          6:"No Set Frequency",
          8:"Weekly",
          5:"Monthly",
          3:"Bi-Weekly",
          2:"Bi-Monthly",
          7:"Quarterly",
          1:"Annually",
          4:"Daily"
  }
  public options2 = [
  
                     {"id": 1, "name": "Application Name"},
                     {"id": 2, "name": "Application Code"},
                     {"id": 3, "name": "Customer Name"},
                     {"id": 4, "name": "Customer Code"},
            
                    ]
          
                    spinnerText = MessageConstants.SPINNERTEXT;
                    hideSpinner = false;
  public customerNameOptions=[{"id":0,"name":"Customer Name"},{"id":1,"name":"Axel"},{"id":2,"name":"Bob"},{"id":3,"name":"George"},{"id":4,"name":"Lisa"}]					
  public customerCodeOptions=[{"id":0,"name":"Customer Code"},{"id":1,"name":"A123"},{"id":2,"name":"B457"},{"id":3,"name":"G673"},{"id":4,"name":"L123"}]						
  public selectedoption = this.options2[0].id;
  public selectedoption1 = 1;
  applicationList = ['Filter by','Application Name', 'Application Code','Customer Name']
  selectedcol = this.applicationList[0];
  SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
  allApplications: Observable<Application[]>; 
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<Application>(); 
  id:1;
  // search no data found
	isTableHasData = true;
	highlightedRows = [];
	customerList: Observable<Customer[]>; 
	names: Customer[] = [];
	customerArray=[];
  applicationArray=[];
  ifFilterBySelected: boolean = true;
  noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
  isExistInSession :  boolean = false;
  hasScreenDeletePriviledge : boolean = false;
  constructor(private formbulider: FormBuilder, 
              private applicationservice:ApplicationService, 
              private errorService: ErrorHandlerService,
              private popupService: PopupMessageService,
              private userPrivilegesService: UserPrivilegesService,
			  private customerservice: CustomerService,
              private router: Router  ) { 
                if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.applicationScreenName)) {
                  this.hasScreenDeletePriviledge = true;

                 this. custableColumns  = ['applicationName',
                  'applicationCode',
                  'customerName',
                  'customerCode',
                  'customerState',
                  'customerFlag',
                  'appType',
                  'software',
                  'perfPatternDescription',
                  'runFrequencyName',
                  'delete'
                 ];
                }
              }

  ngOnInit() {
    this.loadCustomerList();
    this.loadSearchCriteria();
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
      if(localStorage.clickedRow){
        //this.selectedoption1=parseInt(localStorage.selectedItem);
        this.searchText=localStorage.searchText;
        this.ifFilterBySelected = false;
        this.selectRow(JSON.parse(localStorage.clickedRow));
        if(this.searchText=='' || this.searchText==undefined || this.searchText==null){
          this.loadAllApplications();
        }
        else{
          this.filterApplicationArray(this.selectedoption1);
        }
        localStorage.removeItem('clickedRow');
        localStorage.removeItem('selectedItem');
        localStorage.removeItem('searchText');
      }
  }
  checkFilterBySelected() {
		this.ifFilterBySelected = this.selectedoption == 1 ? true : false;
		this.searchText = "";
	}
  
	openApplicationScreen(row) {
    this.id=row.applicationID;
    localStorage.clickedRow=JSON.stringify(row);
		this.router.navigate(['./add_application',this.id]); 
		
  }
  
  loadSearchCriteria(){
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length>0?searchCriteriaObj.findIndex(x=>x.screenName == Constants.ViewEditApplicationSubmenu):-1;
		if(index == -1){
			this.selectedoption1 = 1;
			this.isExistInSession = false;
		}
		else{
			this.selectedoption1=searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}


	loadAllApplications() { 
    this.hideSpinner = true;
    localStorage.removeItem('clickedRow');
    localStorage.removeItem('selectedItem');
    localStorage.removeItem('searchText');
			this.allApplications = this.applicationservice.getAllApplications(); 	   
			this.allApplications.subscribe(results => {
				if (!results) { 
          this.hideSpinner = false;
          return };
        this.applicationArray	=results;
        this.dataSource.data = [];
        this.dataSource.data = this.applicationArray;
        this.dataSource.sort = this.sort;
				if(this.dataSource.data.length > 0){
				this.isTableHasData = true;
				} 
				else {
					this.isTableHasData = false;
        }
        this.hideSpinner = false;
			},
			(error) => {
        this.hideSpinner = false;
				this.errorService.handleError(error);
			});
		}  

  
    async deleteApplication(recordID){
      const response = await this.popupService.openConfirmDialog("This Application may have dependent records in other tables of the database. Deleting this record may disturb the integrity of the database.<br/> Are you sure you want to delete anyway?", "help_outline");
      if (response === "ok") {
        this.applicationservice.deleteApplicationeById(recordID).subscribe(result => {
          this.deleteApplicationFunctionality();
        },
          (error) => {
            this.errorService.handleError(error);
          });
      }
    }


    async deleteApplicationFunctionality(){
      await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Application", "check_circle", false);
      this.doFilter(this.selectedoption1);
    }

  public doFilter(selectedVal:number) {
   if(selectedVal!=0 && selectedVal!=-1){
        if(this.searchText!=null && this.searchText!='' && this.searchText.trim().length!=0){
          let filteredResults=[];
          switch(selectedVal){
            case 1:this.filterApplicationArray(1);
                   break;
            case 2:this.filterApplicationArray(2);
                   break;
            case 3:this.filterApplicationArray(3);
                   break;
            case 4:this.filterApplicationArray(4);
                   break;
           
          }
       

           this.dataSource.filter = this.searchText.toLowerCase().trim(); 
           let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
          let index = searchCriteriaObj.length>0?searchCriteriaObj.findIndex(x=>x.screenName == Constants.ViewEditApplicationSubmenu):-1;
            if(index == -1){
            this.isExistInSession = true;
            searchCriteriaObj.push({screenName :Constants.ViewEditApplicationSubmenu,searchBy: selectedVal});
          }
          else{
            searchCriteriaObj[index].searchBy = selectedVal;
          }
          localStorage.setItem("searchCriteriaObj", JSON.stringify(searchCriteriaObj));
       }
        else{
          this.loadAllApplications();
        }
    }
    else{
       this.popupService.openAlertDialog("Please select search option", "Application", "check_circle",false);
    }
  }
  
  filterApplicationArray(caseNumber){
    let searchField = this.searchText.toLowerCase().trim();
    if(searchField.indexOf('*')==-1){
      searchField+='*';
    }
    searchField = "'" + searchField.replace(/'/g, "''") + "'";
    let searchOption;        
    if(caseNumber===1){
      searchOption='appName';
    }else if(caseNumber===2){
      searchOption='appCode';
    }else if(caseNumber===3){
      searchOption='custName';
    }else if(caseNumber===4){
      searchOption='custCode';
    }

    let searchObject={
      'SearchOption':searchOption,
      'SearchText':searchField,
    }
    this.hideSpinner = true;
    this.allApplications = this.applicationservice.getApplicationsBasedOnSearch(searchObject); 	   
			this.allApplications.subscribe(results => {

				if (!results) { 
          this.isTableHasData = false;
          this.dataSource.data = [];
          this.hideSpinner = false;
          return };
        this.applicationArray	=results;
				if(results.length > 0){
              this.isTableHasData = true;
              localStorage.selectedItem=caseNumber;
              localStorage.searchText=this.searchText;
              this.dataSource = new MatTableDataSource<Application>()
              this.dataSource.data=this.applicationArray;
              this.dataSource.sort=this.sort;
              this.hideSpinner = false;
				} 
				else {
          this.isTableHasData = false;
          this.dataSource.data = [];
          this.hideSpinner = false;
				}
			},
			(error) => {
        this.hideSpinner = false;
				this.errorService.handleError(error);
			});
    
  }
   selectRow(row) {
		  this.highlightedRows.pop();
		  this.highlightedRows.push(row);
		}
	
  searchText:string; 
  clearCustomerData(){  
  this.isTableHasData = true;
  this.dataSource.data = [];
  this.dataSource.filter='';
  this.searchText='';   

  localStorage.removeItem('clickedRow');
  localStorage.removeItem('selectedItem');
  localStorage.removeItem('searchText');
    if(!this.isExistInSession){
			this.selectedoption1 = 1;
  }    
  this.ifFilterBySelected = true;
  this.loadSearchCriteria()                    
 // this.selectedoption1 = this.options2[0].id;
}
  
 omit_special_char(event)
 {
    var k;  
    k = event.charCode; 
    if((k==42)||(k==39) || (k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57) || (k == 45) || k == 38 || k == 45 || k == 40 || k == 41 || k == 44 || k == 46){
      let inputData = event.srcElement.value;
      let maxAllow = 0;
      if (inputData != undefined && inputData != '') {
        if (inputData[inputData.length - 1] == event.key && event.key == '*' || inputData[inputData.length - 1] == event.key && event.key == "'") {
          return false;
        }
         for(let i=0;i<inputData.length;i++){
           if(inputData[i]=='*'){
            maxAllow+=1;
            if(maxAllow==2 && event.key == '*' ){
              return false;
            }
           }
           
         }
      }
    }
    else{
      return false;
    }
   
 }

	searchCustomerData()
	{
		 this.loadAllApplications();
	}
	
	 //loadCustomerList
	loadCustomerList() {    
		
			this.customerList = this.customerservice.getAllCustomers(); 	   
			this.customerList.subscribe(results => {
					this.names = results;
					this.customerArray = results;
		  });    
	}  
}

