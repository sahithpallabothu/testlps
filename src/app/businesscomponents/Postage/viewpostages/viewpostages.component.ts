import { Component, OnInit,ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms';  
import {MatSort, MatTableDataSource, MatPaginator, MatRadioButton,MatRadioGroup,ErrorStateMatcher} from '@angular/material';
import { Observable } from 'rxjs';
import { PostageService } from '../../../businessservices/postage/postage.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { Postage } from '../../../businessclasses/Postage/postage';  
import { PopupMessageService } from '../../../shared/popup-message.service';
import {Router} from '@angular/router';
import { UpdatepostageComponent } from '../../../businesscomponents/Postage/updatepostage/updatepostage.component'; 
// import { UpdatepostageNewComponent } from '../../../businesscomponents/Postage/updatepostage/updatepostage-new.component'; 
import { CustomerService } from '@/businessservices/customer/customer.service';
import { Customer } from '@/businessclasses/Customer/customer';
import { Application } from '../../../businessclasses/application/application';  
import { ApplicationService } from '../../../businessservices/application/application.service';
@Component({
  selector: 'app-viewpostages',
  templateUrl: './viewpostages.component.html',
  styleUrls: ['./viewpostages.component.css']
})
export class ViewpostagesComponent implements OnInit {
    ifDateSelected=true;
	ifFilterBySelected=true;
	isTableHasData = true;
	searchText:string;
	allpostages:Observable<Postage[]>;
	@ViewChild(MatSort) sort: MatSort;
	highlightedRows = [];
	id:1;
	customerDetails: Customer[] = [];
	 applicationDetails:Application[]=[];
	 customerList: Observable<Customer[]>;
	 applicationList: Observable<Application[]>;
	 customerArray=[];
	 applicationArray=[];
    dataSource = new MatTableDataSource<Postage>();
	
	selectedStartDate:string;
	selectedEndDate:string;
	
	
	
	custableColumns  :  string[] = ['inputName',
                                'outputName',
								'upload',
								'received',
								'processed',
								'accounts',
								'runDate',
								'billDate',
								'postedDate',
								'print',
								];
	public customersInViewPostage = [
                     {"id": 0, "name": "Customer Name"},
                     {"id": 1, "name": "Albemarle EMC"},
                     {"id": 2, "name": "Athens-Clarke County Public Utilities (GA)"},
                     {"id": 3, "name": "Bartholomew County REMC"},
                     {"id": 4, "name": "Cablevision of Marion County"},
                     {"id": 5, "name": "Citizens Electric Corporation"},
                     {"id": 6, "name": "City of Laurel Public Utility"},
                     {"id": 7, "name": "Deep East Texas ECI"},
                     {"id": 8, "name": "PenTex Energy"},
                     {"id": 9, "name": "Starkville Utilities"},
                     {"id": 10, "name": "Westminster Utility Department"},
                     {"id": 11, "name": "Easley Combined Utilities"},
                    ]
  public selectedCustomerNameInViewPostage = this.customersInViewPostage[0].id;
 public customerCodesInViewPostage = [
                     {"id": 0, "name": "Customer Code"},
                     {"id": 1, "name": "ALB"},
                     {"id": 2, "name": "APU"},
                     {"id": 3, "name": "BRI"},
                     {"id": 4, "name": "MCF"},
                     {"id": 5, "name": "CEM"},
                     {"id": 6, "name": "LMS"},
                     {"id": 7, "name": "DET"},
                     {"id": 8, "name": "CCT"},
                     {"id": 9, "name": "SEM"},
                     {"id": 10, "name": "WMS"},
                     {"id": 11, "name": "EUS"},
                    ]
  public selectedCustomerCodeInViewPostage = this.customerCodesInViewPostage[0].id;
 public applicationsInViewPostage = [
                     {"id": 0, "name": "Application Name"},
                     {"id": 1, "name": "Albemarle EMC"},
                     {"id": 2, "name": "Athens-Clarke County Public Utilities (GA)"},
                     {"id": 3, "name": "Bartholomew County REMC CC Check"},
                     {"id": 4, "name": "Cablevision of Marion County"},
                     {"id": 5, "name": "Citizens Electric Corporation"},
                     {"id": 6, "name": "City of Laurel Public Utility Letter"},
                     {"id": 7, "name": "Gary Deep East Texas ECI"},
                     {"id": 8, "name": "PenTex Energy CC Check"},
                     {"id": 9, "name": "Starkville Utilities Delinquent"},
                     {"id": 10, "name": "Westminster Utility Department"},
                     {"id": 11, "name": "Easley Combined Utilities Blank Bill"},
                    ]
  public selectedApplicationNameInViewPostage = this.applicationsInViewPostage[0].id;
 public applicationCodesInViewPostage = [
                     {"id": 0, "name": "Application Code"},
                     {"id": 1, "name": "ALB"},
                     {"id": 2, "name": "APU"},
                     {"id": 3, "name": "BRIR"},
                     {"id": 4, "name": "MCF"},
                     {"id": 5, "name": "CEM"},
                     {"id": 6, "name": "LMSL"},
                     {"id": 7, "name": "GWD"},
                     {"id": 8, "name": "CCTR"},
                     {"id": 9, "name": "SEMD"},
                     {"id": 10, "name": "WMSW"},
                     {"id": 11, "name": "EUSB"},
                    ]
  public selectedApplicationCodeInViewPostage = this.applicationCodesInViewPostage[0].id;
  public DateFieldInViewPostage = [
                     {"id": 0, "name": "Search Criteria"},
                     {"id": 1, "name": "Bill Date"},
                     {"id": 2, "name": "Run Date"},
                     {"id": 3, "name": "Posted Date"}
                    ]
  public selectedDateFieldInViewPostage = -1;
  public filterByInViewPostage = [
                     {"id": 0, "name": "Search by"},
                     {"id": 1, "name": "Job Name"},
                     {"id": 2, "name": "Input Name"}
                    ]
  public selectedFilterByInViewPostage = -1;
  
  constructor(private errorService: ErrorHandlerService,
              private popupService: PopupMessageService,
              private router: Router,
			  private applicationservice:ApplicationService,
			  private customerservice: CustomerService,
			  private postageService:PostageService) { }

  ngOnInit() {
	  this.loadCustomerList();
	  this.loadApplicationList();
	  this.loadAllPostageDetails();
  }
  
  openPostageScreen(vid:UpdatepostageComponent) {
   
    this.id=1;
    this.router.navigate(['./update_postages',this.id]); 
}

  loadAllPostageDetails(){
	   /* this.allpostages = this.postageService.getallPostages(); 	   
			this.allpostages.subscribe(results => {
				if (!results) { return };        
        this.dataSource.sort = this.sort;
				 this.dataSource.data = results;
				if(this.dataSource.data.length > 0){
				 this.isTableHasData = true;
				 } 
				else {
					 this.isTableHasData = false;
				 }
			},
			 (error) => {
				 this.errorService.handleError(error);
			}); */
  }
  checkDateSelected(){
	 
	  if(this.selectedDateFieldInViewPostage==0){
		  this.ifDateSelected= true;
	  }
	  else{
		  this.ifDateSelected= false;
	  }
  }
  checkFilterBySelected(){
	  if(this.selectedFilterByInViewPostage==0){
		  this.ifFilterBySelected=true;
		  this.searchText="";
	  }
	  else{
		  this.ifFilterBySelected=false;
	  }
  }
  selectRow(row) {

		  this.highlightedRows.pop();
		  this.highlightedRows.push(row);
		}
		
	//loadCustomerList
	loadCustomerList() { 
			this.customerList = this.customerservice.getAllCustomers(); 	   
			this.customerList.subscribe(results => {
					this.customerDetails = results;
					this.customerArray = results;
		    });    
	}  
	loadApplicationList(){
		this.applicationList = this.applicationservice.getAllApplications(); 	   
			this.applicationList.subscribe(results => {
					this.applicationDetails = results;
					this.applicationArray = results;
		    });
	}
	
	//clear Search Fields
	clearSearchFields(){
		this.selectedDateFieldInViewPostage = -1;//this.DateFieldInViewPostage[0].id;
		this.selectedFilterByInViewPostage = -1;//this.filterByInViewPostage[0].id;
		this.searchText='';
		this.dataSource.data =[];
		this.dataSource.filter='';
		this.ifDateSelected= true;
		this.ifFilterBySelected=true;
		this.isTableHasData = false;
		
		this.selectedCustomerNameInViewPostage=this.customersInViewPostage[0].id;
		this.selectedCustomerCodeInViewPostage = this.customerCodesInViewPostage[0].id;
		this.selectedApplicationNameInViewPostage=this.applicationsInViewPostage[0].id;
		this.selectedApplicationCodeInViewPostage = this.applicationCodesInViewPostage[0].id;
		this.selectedStartDate='';
		this.selectedEndDate='';
		// remain fileds 
	}
	
	//doFilter key event
	public doFilter(filterValue: string) {
		
		this.dataSource.filterPredicate =(data: any, filter: string)=>{                        
			return data.inputName.toLowerCase().indexOf(filter) != -1;                                                               
		}
		
		// if(selectedVal===2){
			// console.log("outputName",selectedVal);
			// this.dataSource.filterPredicate =(data: any, filter: string)=>{                        
				// return data.outputName.toLowerCase().indexOf(filter) != -1;                                                               
			// }
		// }
		
		this.dataSource.filter = filterValue.trim().toLowerCase();
		if(this.dataSource.filteredData.length > 0){
			this.isTableHasData = true;
		} 
		else {
			this.isTableHasData = false;
		}
		
		if(this.dataSource.data.length <= 0){
			this.loadAllPostageDetails();	
		}
		
		
	}
	
	//searchPostageData 
	searchPostageData(){		
		this.loadAllPostageDetails();				
	}
	
	
	
}
