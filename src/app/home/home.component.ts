import { MatSort, MatTableDataSource } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable} from 'rxjs';
import { ErrorHandlerService } from '@/shared/error-handler.service';
import { PopupMessageService } from '@/shared/popup-message.service';
import { Customer } from '@/businessclasses/Customer/customer';
import { Router} from '@angular/router';
import { UserService, AlertService } from '@/_services';
import { CustomerService } from '@/businessservices/customer/customer.service';
import { ApplicationService } from '@/businessservices/application/application.service';
import { Application } from '@/businessclasses/Application/application';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { HomeserviceService } from '@/businessservices/home/homeservice.service';
import { Postage } from '@/businessclasses/postage/Postage';
import { Inserts } from '@/businessclasses/Inserts/Insert';
import { AddcustomerComponent } from '../businesscomponents/Customer/addcustomer/addcustomer.component';
import { ServiceAgreementDialogComponent } from '@/businesscomponents/Customer/service-agreement-dialog/service-agreement-dialog.component';
import { ContactDialogComponent } from '../businesscomponents/Customer/contact-dialog/contact-dialog.component';
import { PopupDialogService } from '@/shared/popup-dialog.service';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { HomeSearch } from '@/businessclasses/Home/home';
import { AddApplicationNewComponent } from '@/businesscomponents/Application/add-application-new/add-application-new.component';
import { MessageConstants } from '../../../src/app/shared/message-constants';
import { DatePipe } from '@angular/common';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { InsertService } from '@/businessservices/insert/insert.service';
import { AuthenticationService } from '@/_services';
import { CustomDateConvertor } from '@/shared/customDateConvertor';
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

	//Variable Declarations.
	spinnerText = MessageConstants.SPINNERTEXT;
	noDataFound : string =MessageConstants.NODATAFOUNDMESSAGE;
	hideSpinner= false;
	spinnerFlag=0;
	id: number;
	defaultEndDate : any;
	defaultStartDate : any
	appChanged : boolean;
	fromHome : boolean = true;

	invalidAppName : boolean = false;
	invalidAppCode  : boolean = false;
	invalidCustName : boolean = false;
	invalidCustCode  : boolean = false;

	customerName: string;
	customerCode: string;
	applicationName: string;
	applicationCode: string;
	name: any;
	selectedoption = null;
	selected = null;
	customerArray = [];
	AppCodeList: Array<string> = [];
	AppCode: string;
	applicationArray = [];

	currentDate: any;
	customername: string;
	isvalid: boolean = false;
	holdFlag: boolean = false;
	selectedCustID: number;
	selectedAppID: number;
	selectedClientID : number;
	holdAppCode: string;
	isempty = false;
	isFound = false;
	startOfEndDate: Date;

	isInsertsClicked: boolean = false;
	errorMatcher = new ErrorMatcher();
	selectedCustomerName: string;
	selectedCustomerCode: string;
	selectedCustomerTelephone: string;

	tabIndexValue = 0;
	invalidEndDate : boolean = false;

	customerList: Observable<Customer[]>;
	applicationList: Observable<Application[]>;
	allJobs: Observable<Postage[]>;
	inserts: Observable<Inserts[]>;
	customerNames: Customer[] = [];
	application: Application[] = [];
	//declarations for panals.
	isInsertsResultsPanelOpen = false;
	jobsDataPanelOpenState = false;
	serviceCheckBoxes = true;
	//Mask for date and telephone.
	dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	telephonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
	homeScreenForm: FormGroup;
	editApplicationDialogShow: boolean = false;
	//grid declarations.
	highlightedRows = [];
	tableColumnsForJobs: string[] = ['inputName',  'upload', 'received', 'processedDate', 'accountsDetail', 'runDate', 'billDate', 'postDate', 'printed'];//'outputName',
	tableColumnsForInserts: string[] = ['applicationCode', 'startDate', 'endDate', 'insertType', 'number', 'returnInserts', 'returnedQuantity','usedQuantity','weight','reorderQuantity','receivedQuantity', 'receivedDate',
	'receivedBy','binLocation','description', 'active','locationInserts'];// 'code',
	isTableHasDataForInserts = true;
	isTableHasData = true;
	dataSource = new MatTableDataSource<Customer>();
	jobsDataSource = new MatTableDataSource<any>();
	insertsDataSource = new MatTableDataSource<any>();

	filteredOptionsCustomer: Observable<Customer[]>;
	filteredOptionsCustomerCode: Observable<Customer[]>;
	filteredOptionsApplicationName: Observable<Application[]>;
	filteredOptionsApplicationCode: Observable<Application[]>;

	@ViewChild('sortJob') sortJob: MatSort;
	@ViewChild('sortInsert') sortInsert: MatSort;
	@ViewChild('startDate') startDate: ElementRef;
	@ViewChild('endDate') endDate: ElementRef;
	@ViewChild('custName') custName: ElementRef<any>;
	@ViewChild('appName') appName: ElementRef<any>;
	@ViewChild('custCode') custCode: ElementRef<any>;
	@ViewChild('appCode') appCode: ElementRef<any>;
	@ViewChild('stDateFocus') stDateFocus: ElementRef<any>;
	@ViewChild('matCardContentMoveSmooth') matCardContentMoveSmooth: ElementRef<any>;
	@ViewChild('matCardContentMoveSmoothInserts') matCardContentMoveSmoothInserts: ElementRef<any>;

	
	
	// Screen Privilage variables
	hasApplicationScreenPrivilege : boolean = false;
	hasCustomerScreenPrivilege : boolean = false;
	hasPostageScreenPrivilege : boolean = false;
	hasInsertScreenPrivilege : boolean = false;
	
	isCount : number = 1;
	constructor(
		private authenticationService: AuthenticationService,
		private formbulider: FormBuilder,
		private customerservice: CustomerService,
		private popupService: PopupMessageService,
		private dialog: MatDialog,
		private router: Router,
	    private homeservice: HomeserviceService,
		private errorService: ErrorHandlerService,
		private insertService: InsertService,
		private popupdlgService: PopupDialogService,
		public datepipe: DatePipe,
		private userPrivilegesService: UserPrivilegesService,
		private applicationservice: ApplicationService,
	) {
		this.setPrivileges();
	 }

	ngOnInit() {
		//check user session
		this.errorService.IsValidUserSession();
		this.homeScreenForm = this.formbulider.group({
			CustomerName: [, []],
			CustomerCode: [, []],
			Telephone: [, []],
			Fax: [, []],
			IVRPhoneNumber: [, []],
			SpeedDail: [, []],
			DM: [, []],
			EBPP: [, []],
			IVR: [, []],
			PDF: [, []],
			MailerID: [, [Validators.pattern(/^[0-9]+$/)]],
			CRID: [, [Validators.pattern(/^[0-9]+$/)]],
			ApplicationName: [, []],
			ApplicationCode: [, []],
			startDate: [, [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			endDate: [, [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],//,validateStartAndEndDate()
			startDateWithPicker: [, []],
			endDateWithPicker: [, []],
			comments: [, []]
		});
		this.loadCustomerList();
		this.loadApplicationList();
		this.homeScreenForm.controls['DM'].disable();
		this.homeScreenForm.controls['EBPP'].disable();
		this.homeScreenForm.controls['IVR'].disable();
		this.homeScreenForm.controls['PDF'].disable();
		this.homeScreenForm.controls['Telephone'].disable();
		this.homeScreenForm.controls['Fax'].disable();
		this.homeScreenForm.controls['IVRPhoneNumber'].disable();
		this.homeScreenForm.controls['MailerID'].disable();
		this.homeScreenForm.controls['CRID'].disable();
		this.homeScreenForm.controls['comments'].disable();

		//getting data from local storage after navigating back to home.
		if (localStorage.getItem('homeData') != null && localStorage.getItem('backButtonClicked') == 'clicked') {
			const homeData = JSON.parse(localStorage.getItem("homeData"));
			this.homeScreenForm.controls['CustomerName'].setValue(homeData.CustomerName);
			this.homeScreenForm.controls['CustomerCode'].setValue(homeData.CustomerCode);
			this.homeScreenForm.controls['ApplicationName'].setValue(homeData.ApplicationName);
			this.homeScreenForm.controls['ApplicationCode'].setValue(homeData.ApplicationCode);
			this.homeScreenForm.controls['CRID'].setValue(homeData.CRID);
			this.homeScreenForm.controls['DM'].setValue(homeData.DM);
			this.homeScreenForm.controls['EBPP'].setValue(homeData.EBPP);
			this.homeScreenForm.controls['Fax'].setValue(homeData.Fax);
			this.homeScreenForm.controls['IVRPhoneNumber'].setValue(homeData.IVRPhoneNumber);
			this.homeScreenForm.controls['IVR'].setValue(homeData.IVR);
			this.homeScreenForm.controls['MailerID'].setValue(homeData.MailerID);
			this.homeScreenForm.controls['PDF'].setValue(homeData.PDF);
			this.homeScreenForm.controls['Telephone'].setValue(homeData.Telephone);
			this.homeScreenForm.controls['comments'].setValue(homeData.comments);
			let currentDate = new Date();
			this.selectedCustID = homeData.clientID;
			this.AppCode = homeData.AppCode;
			this.holdFlag = homeData.holdFlag;
			if (homeData.fromGrid == "Inserts") {
				this.isInsertsClicked = true;
			} else {
				this.isInsertsClicked = false;
			}
			this.defaultEndDate = this.datepipe.transform(new Date(), MessageConstants.DATEFORMAT).toString()
			this.defaultStartDate = this.datepipe.transform(new Date(currentDate.setDate(currentDate.getDate()-30)),MessageConstants.DATEFORMAT).toString();
			if((homeData.endDate === this.defaultEndDate) && (homeData.startDate === this.defaultStartDate)){
				this.homeScreenForm.controls['endDate'].setValue(null);
				this.homeScreenForm.controls['startDateWithPicker'].setValue(null);
				this.homeScreenForm.controls['endDateWithPicker'].setValue(null);
				this.homeScreenForm.controls['startDate'].setValue(null);
			}
			else{
				this.homeScreenForm.controls['endDate'].setValue(homeData.endDate);
				this.homeScreenForm.controls['startDateWithPicker'].setValue(new Date(homeData.startDate));
				this.homeScreenForm.controls['endDateWithPicker'].setValue(new Date(homeData.endDate));
				this.homeScreenForm.controls['startDate'].setValue(homeData.startDate);
			}

			if(homeData.appChanged){
				this.fromHome = false;
				this.application= homeData.application;

			}
		
			this.openPanelAfterRedirection(homeData.insertPanel, homeData.jobresultsPanel);
			this.searchHomeFormData();
			localStorage.removeItem('homeData');
			localStorage.removeItem('backButtonClicked');
		}

		

		//sort job data source 
		this.jobsDataSource.sortingDataAccessor = (item, property) => {

			switch (property) {
				case 'upload': return new Date(item.upload);
				case 'received': return new Date(item.received);
				case 'processedDate': return new Date(item.processedDate);
				case 'runDate': return new Date(item.runDate);
				case 'postDate': return new Date(item.postDate);
				case 'billDate': return new Date(item.billDate);
			  }

			if (typeof item[property] === 'string') {
				return item[property].toLocaleLowerCase();
			}
			return item[property];
		  };

		  //sort Inserts data source 
		  this.insertsDataSource.sortingDataAccessor = (item, property) => {

			switch (property) {
				case 'startDate': return new Date(item.startDate);
				case 'endDate': return new Date(item.endDate);
				case 'receivedDate': return new Date(item.receivedDate);
			  }

			if (typeof item[property] === 'string') {
				return item[property].toLocaleLowerCase();
			}
			return item[property];
		  };

		if(Constants.SSO){
		 this.authenticationService.checkAdminExist();
			if(JSON.parse(sessionStorage.getItem('AdminExist'))==false){
				this.popupService.openAlertDialog("The application does not currently have a user with access to the Admin screens. Please grant 'Admin' role or create a role with full access on Admin screens to atleast one user. ", "Home", "check_circle",true);
			}
		}
	}

	setPrivileges(){
		let userPrivilegedScreens = this.userPrivilegesService.getLoginUserPrivilegedScreens;
		if( userPrivilegedScreens.length > 0 ){
			userPrivilegedScreens.forEach((currenntitem , index )=> {
				 let privillages : string = userPrivilegedScreens[index].privilege != null ? userPrivilegedScreens[index].privilege : null; 
				  switch(currenntitem.screenName.toLowerCase().trim()){
					   case Constants.applicationScreenName.toLowerCase().trim() :
							  if(privillages != null && (privillages.search('R') !== -1 || privillages.search('U') !== -1 || privillages.search('I') !== -1)) 
								 this.hasApplicationScreenPrivilege = true;								 														 
							 break;
					   case Constants.customerScreenName.toLowerCase().trim() :
							  if(privillages != null && (privillages.search('R') !== -1 || privillages.search('U') !== -1 || privillages.search('I') !== -1)) {
								this.hasCustomerScreenPrivilege = true; 
							  }
							 break;
					   case Constants.postageScreenName.toLowerCase().trim() :
							   if(privillages != null && (privillages.search('R') !== -1 || privillages.search('U') !== -1)){
								   this.hasPostageScreenPrivilege = true;
							   }
							
							   break;
					   case Constants.insertsScreenName.toLowerCase().trim():
							   if(privillages != null && (privillages.search('R') !== -1 || privillages.search('U') !== -1 || privillages.search('I') !== -1 || privillages.search('D') !== -1)){
								   this.hasInsertScreenPrivilege = true;
							   } 
								
							 break;		 
				 }					
			 });			   	  
		 } 
	}

	openPanelAfterRedirection(inserts, jobs) {
		this.jobsDataPanelOpenState = jobs;
		this.isInsertsResultsPanelOpen = inserts;
	}

	displayFn(user?: Customer): string | undefined {
		return user ? user.customerName : undefined;
	}

	displayFnCustCode(user?: Customer): string | undefined {

		return user ? user.customerCode : undefined;
	}

	private _filter(name: string): Customer[] {
		const filterValue = name.toLowerCase();
		return this.customerNames.filter(option => option.customerName.toLowerCase().indexOf(filterValue) === 0);
	}
	// For Cust code.
	private _filterCustCode(name: string): Customer[] {
		const filterValue = name.toLowerCase();
		return this.customerNames.filter(option => option.customerCode.toLowerCase().indexOf(filterValue) === 0);
	}

	//to initialize customer name and code to auto complete
	initializeAutocompleteCustomer() {
		this.filteredOptionsCustomer = this.homeScreenForm.controls['CustomerName'].valueChanges
			.pipe(
				startWith<string | Customer>(''),
				map(value => typeof value === 'string' ? value : value.customerName),
				map(customername => customername ? this._filter(customername) : this.customerNames.slice())
			);
		this.filteredOptionsCustomerCode = this.homeScreenForm.controls['CustomerCode'].valueChanges
			.pipe(
				startWith<string | Customer>(''),
				map(value => typeof value === 'string' ? value : value.customerCode),
				map(ccode => ccode ? this._filterCustCode(ccode) : this.customerNames.slice()),
				map(ccode => ccode.sort((a, b) => (a.customerCode > b.customerCode) ? 1 : ((b.customerCode > a.customerCode) ? -1 : 0)))
			);

	}

	//to initialize Application name and code to auto complete
	initializeAutocompleteApplication() {
		this.filteredOptionsApplicationName = this.homeScreenForm.controls['ApplicationName'].valueChanges
			.pipe(
				startWith<string | Application>(''),
				map(value => typeof value === 'string' ? value : value.applicationName),
				map(applicationname => applicationname ? this._filterApplicationName(applicationname) : this.application.slice())
			);
		this.filteredOptionsApplicationCode = this.homeScreenForm.controls['ApplicationCode'].valueChanges
			.pipe(
				startWith<string | Application>(''),
				map(value => typeof value === 'string' ? value : value.applicationCode),
				map(ccode => ccode ? this._filterApplicationCode(ccode) : this.application.slice()),
				map(ccode => ccode.sort((a, b) => (a.applicationCode > b.applicationCode) ? 1 : ((b.applicationCode > a.applicationCode) ? -1 : 0)))
			);
	}

	//Method to filter application name.
	private _filterApplicationName(name: string): Application[] {
		const filterValue = name.toLowerCase();
		return this.application.filter(option => option.applicationName.toLowerCase().indexOf(filterValue) === 0);
	}

	// For Cust code.
	private _filterApplicationCode(name: string): Application[] {
		const filterValue = name.toLowerCase();
		return this.application.filter(option => option.applicationCode.toLowerCase().indexOf(filterValue) === 0);
	}

	//Display function for Application Name.
	displayFnApplicationName(user?: Application): string | undefined {
		return user ? user.applicationName : undefined;
	}

	//Display function for Application Code.
	displayFnApplicationCode(user?: Application): string | undefined {
		return user ? user.applicationCode : undefined;
	}

	//loadCustomerList
	loadCustomerList() {
		this.customerList = this.customerservice.getAllCustomers();
		this.customerList.subscribe(results => {
			this.customerNames = results;
			this.customerArray = results;
			this.customerNames.sort((a, b) => (a.customerName > b.customerName) ? 1 : ((b.customerName > a.customerName) ? -1 : 0));
			this.initializeAutocompleteCustomer();
		});
	}

	//load Application List
	loadApplicationList() {
		this.applicationArray = [];
		this.applicationList = this.insertService.getAllApplications();
		this.applicationList.subscribe(results => {
			if(this.fromHome && this.isCount<2){
				this.application = results;
			}
			
			this.applicationArray = results;
			this.applicationArray.sort((a, b) => (a.applicationName > b.applicationName) ? 1 : ((b.applicationName > a.applicationName) ? -1 : 0));
			this.initializeAutocompleteApplication();
		});
	}

	// stop the spinner
	deactiveSpinner(){
		this.spinnerFlag++;
		if(this.spinnerFlag==2){
			this.hideSpinner = false;
			this.spinnerFlag=0;
		}
	}

	//load jobs and inserts data count.
	  loadJobsAndInsertsDataCount(data: HomeSearch) {
	  this.homeservice.getJobsAndInsertsCount(data).subscribe(results => 
	  {
		if (!results) { return };
		if (results.message == MessageConstants.MAX_LIMIT_EXCEEED) 
		{

			this.popupService.openAlertDialog("The current criteria for this search may result in a timeout. Please enter some additional criteria and try again.", "Home", "check_circle");
		}
		else {
				 this.loadJobsData(data); 
				 this.loadInsertsData(data); 
			 }
		},
			(error) => {
				
				this.errorService.handleError(error);
			});
	}

	// loadInsertsData
	 loadInsertsData(data: HomeSearch) {
		this.hideSpinner= true;
		this.homeservice.getInserts(data).subscribe(results => {
			if (!results) { return };
			this.insertsDataSource.sort = this.sortInsert;
			this.insertsDataSource.data = results;
			this.isTableHasDataForInserts = this.insertsDataSource.data.length > 0 ? true : false;
			this.deactiveSpinner();
		},
			(error) => {
				this.deactiveSpinner();
				this.errorService.handleError(error);
			});
	}

	//load jobs data.
	loadJobsData(data: HomeSearch) {
		this.hideSpinner= true;
		this.homeservice.getJobs(data).subscribe(results => {
			if (!results) { return };
			this.jobsDataSource.sort = this.sortJob;
			this.jobsDataSource.data = results;
			this.isTableHasData = this.jobsDataSource.data.length > 0 ? true : false;
			this.deactiveSpinner();
		},
			(error) => {
				this.deactiveSpinner();
				this.errorService.handleError(error);
			});
	}

	//searchHomeFormData
	 async searchHomeFormData() {
		let dt = new Date();
		const homeFormData = this.homeScreenForm.value;
		if(((this.homeScreenForm.controls['startDateWithPicker'].value =='Invalid Date' ||
				this.homeScreenForm.controls['startDateWithPicker'].value =="") 
				&& (this.homeScreenForm.controls['startDate'].value!="" &&this.homeScreenForm.controls['startDate'].value!=null)) 
				||((this.homeScreenForm.controls['endDateWithPicker'].value =='Invalid Date'||this.homeScreenForm.controls['endDateWithPicker'].value =="") 
				&& this.homeScreenForm.controls['endDate'].value!="" &&this.homeScreenForm.controls['endDate'].value!=null)){
				this.popupService.openAlertDialog(MessageConstants.INVALIDDATEMESSAGE, "Home", "check_circle",false);
			} 
			 else if((this.homeScreenForm.controls['startDate'].value !='' && this.homeScreenForm.controls['startDate'].value !=null ) &&(this.homeScreenForm.controls['endDate'].value !='' && this.homeScreenForm.controls['endDate'].value !=null) &&!(new Date(this.homeScreenForm.controls['endDate'].value )>= new Date(this.homeScreenForm.controls['startDate'].value ))){
				 this.popupService.openAlertDialog(MessageConstants.ENDDATE_GREATER, "Home", "check_circle",false);
			 } 
			  
			 else if(this.invalidCustName || this.invalidCustCode || this.invalidAppName || this.invalidAppCode || this.validateApplicationForCustomer()){
				 this.popupService.openAlertDialog('Please enter valid data. ', "Home", "check_circle",false);
			 } 
			 //set default date if start date and end date is not provided.
			 else if ((homeFormData.startDate == null||homeFormData.startDate == '') && (homeFormData.endDate == null ||homeFormData.endDate == '') && (homeFormData.startDateWithPicker == null||homeFormData.startDateWithPicker == '') &&(homeFormData.endDateWithPicker == null||homeFormData.endDateWithPicker == '')) {
				 this.currentDate = new Date();
				 this.datepipe.transform(new Date(), MessageConstants.DATEFORMAT).toString(),
				 homeFormData.startDate = 	this.datepipe.transform(new Date(this.currentDate.setDate(this.currentDate.getDate() - 30)),MessageConstants.DATEFORMAT).toString();
				 homeFormData.startDateWithPicker = new Date(this.currentDate.setDate(this.currentDate.getDate() - 30));
				 homeFormData.endDate = this.datepipe.transform(new Date(),  MessageConstants.DATEFORMAT).toString();
				 homeFormData.endDateWithPicker = new Date();
				 this.searchObjCreation(homeFormData);
			 }
			 else{
				 this.searchObjCreation(homeFormData);
			 }
	}
	

	async searchObjCreation(homeFormData){
		let obj = new HomeSearch();
		obj.selectedClientId = this.selectedCustID;
		obj.selectedStartDate = homeFormData.startDate;
		obj.selectedEndDate = homeFormData.endDate;
			if(localStorage.getItem('backButtonClicked') === 'clicked' && localStorage.getItem('homeData') != null && homeFormData.CustomerCode !=null && homeFormData.ApplicationCode != null ){
		
			obj.selectedCustName = homeFormData.CustomerName.customerName;
			obj.selctedcustCode = homeFormData.CustomerCode.customerCode;
			obj.selectedAppName = homeFormData.ApplicationName.applicationName;
			obj.selectedAppCode = homeFormData.ApplicationCode.applicationCode; 
		}  
		else{
			obj.selectedCustName = this.custName.nativeElement.value;
			obj.selctedcustCode = this.custCode.nativeElement.value;
			obj.selectedAppName = this.appName.nativeElement.value;
			obj.selectedAppCode = this.appCode.nativeElement.value;  
		}	
	
	
		if (localStorage.getItem('homeData') == null && localStorage.getItem('backButtonClicked') != 'clicked') {
			this.jobsDataPanelOpenState ==true? this.jobsDataPanelOpenState:this.jobsDataPanelOpenState;
			this.isInsertsResultsPanelOpen==true?this.isInsertsResultsPanelOpen:this.isInsertsResultsPanelOpen;

		}
	
		await this.loadJobsAndInsertsDataCount(obj);
		this.applicationName = this.appName.nativeElement.value;
	}

	//  On Customer  Dropdown change
	isChangeInCustomer(customerObject: any) {
	  this.appChanged = false;
		this.AppCode = '';
		this.AppCodeList = [];
		this.invalidCustName = false;
		this.invalidCustCode = false;
		this.invalidAppCode = false;
		this.invalidAppName = false;
		this.homeScreenForm.controls['CustomerCode'].setValue('');
		this.homeScreenForm.controls['CustomerName'].setValue(''); 
		this.customerOnChange(customerObject.option.value.customerName);
	}

	//On Customer  Dropdown change functionality.
	customerOnChange(customerObject){
		for (let name of this.customerNames) {
			if (name.customerName.toLowerCase() === customerObject.toLowerCase() ||name.customerCode.toLowerCase() === customerObject.toLowerCase() ) {
				this.selectedCustID = name.customerId;
				this.selectedCustomerName = name.customerName;
				this.selectedCustomerCode = name.customerCode;
				this.selectedCustomerTelephone = name.telephone;
				this.populateData(name);
				//setting these values to false because these are not present in customer.
				this.homeScreenForm.controls['DM'].setValue(false);
				this.homeScreenForm.controls['EBPP'].setValue(false);
				this.homeScreenForm.controls['PDF'].setValue(false); 
				
				this.application = [];
				this.homeScreenForm.controls['ApplicationCode'].setValue('');
				this.homeScreenForm.controls['ApplicationName'].setValue('');
			}
		}
		this.setHoldFlagOnCustChange();
	}

	//Populate data for selected customer.
	populateData(name){
		this.homeScreenForm.controls['CustomerCode'].setValue({ customerCode: name.customerCode });
				this.homeScreenForm.controls['CustomerName'].setValue({ customerName: name.customerName });
				this.homeScreenForm.controls['Telephone'].setValue(name.telephone);
				this.homeScreenForm.controls['Fax'].setValue(name.fax);
				this.homeScreenForm.controls['IVRPhoneNumber'].setValue(name.ivrPhoneNumber);
				this.homeScreenForm.controls['comments'].setValue(name.comment);
				this.homeScreenForm.controls['MailerID'].setValue(name.mailerId);
				this.homeScreenForm.controls['CRID'].setValue(name.crid);
				this.homeScreenForm.controls['IVR'].setValue(name.ivr);
	}

	//set hold app code list and populate application drop down for selected customer.
	setHoldFlagOnCustChange(){
		this.appChanged = false;
		this.AppCode = '';
		this.AppCodeList = [];
		this.application = [];
			for (let name of this.applicationArray) {
			if (name.clientID === this.selectedCustID) {
				this.holdFlag = name.processingHold;
				//set hold app code list for selected customer.
				if (this.holdFlag) {
					this.AppCodeList.push(name.applicationCode);
					this.AppCodeList.sort();
					this.AppCode = this.AppCodeList.join() + " " + "on hold";
				}
				//populate application drop down for selected customer.
				this.application.push(name);
				this.appChanged = true;
				if (this.appChanged === true) {
					this.initializeAutocompleteApplication();
				}
			}
		}
		this.holdFlag = true;
	}

	//This method checks whether Application belongs to selected customer or not.
	validateApplicationForCustomer() : boolean {
		var  validAppName = false;
		if( (this.appName.nativeElement.value !='' || this.appCode.nativeElement.value !='')){
			validAppName = (this.application != null && this.application.length > 0) ? 
			(this.application.find(app => (app.applicationName.toLowerCase() === this.appName.nativeElement.value.toLowerCase() || app.applicationCode.toLowerCase() === this.appCode.nativeElement.value.toLowerCase() )) != undefined ? false : true)
			: false;
			return validAppName;
		}
	}

	//Validation for CustomerName AutoComplete.
	validateCustomerNameAutoCompletes(event) {
		this.invalidCustName = false;
		this.invalidCustCode = false;
		this.invalidAppCode = false;
		this.invalidAppName = false;
		let  filterCustomer : any = (event.target.value != null && this.customerNames.length > 0) ? 
		 (this.customerNames.find(cst => cst.customerName.toLowerCase() === event.target.value.toLowerCase()) != undefined ? true : false)
		 : false;
		if (event.target.value =='') {
			this.clearCustomerValuesAndErrors()
			this.application = this.applicationArray;
			this.initializeAutocompleteApplication();
			this.AppCode = '';
			this.clearFormData();
		}
		else if(event.target.value.length > 0){
			if(!filterCustomer){
				this.homeScreenForm.controls['CustomerName'].setErrors({'incorrect': true});
				this.homeScreenForm.controls['CustomerCode'].setValue("");
				this.clearFormData();
				this.homeScreenForm.controls['CustomerCode'].clearValidators();
				this.invalidCustName = true;
			}
			else{
				this.invalidCustName = false;
				this.customerOnChange(event.target.value);
				this.homeScreenForm.controls['CustomerName'].setErrors(null);
			}

		}
		if(event.target.value =='' && this.homeScreenForm.controls['ApplicationName'].value !=''){
			this.setHoldFlagOnAppChange();
		}
	}

	//clear CustomerValues And Errors.
	clearCustomerValuesAndErrors(){
		//clear values.
		this.homeScreenForm.controls['CustomerName'].setValue("");
		this.homeScreenForm.controls['CustomerCode'].setValue("");
		
		//clear validators.
		this.homeScreenForm.controls['CustomerName'].clearValidators();
		this.homeScreenForm.controls['CustomerCode'].clearValidators();
	}

	//Validation for CustomerCode.
	validateCustomerCodeAutoCompletes(event){
		this.invalidCustName = false;
		this.invalidCustCode = false;
		this.invalidAppCode = false;
		this.invalidAppName = false;
		let  filterCustomerCode : any = (event.target.value != null && this.customerNames.length > 0) ? 
		(this.customerNames.find(cst => cst.customerCode.toLowerCase() === event.target.value.toLowerCase()) != undefined ? true : false)
		: false;
	   if (event.target.value =='') {
		   this.clearCustomerValuesAndErrors();
		   this.application = this.applicationArray;
		   this.initializeAutocompleteApplication();
		   this.AppCode = '';
		   this.clearFormData();
	   }
	   else if(event.target.value.length > 0){
		   if(!filterCustomerCode){
			   this.homeScreenForm.controls['CustomerCode'].setErrors({'incorrect': true});
			   this.homeScreenForm.controls['CustomerName'].setValue("");
			   this.clearFormData();
			   this.homeScreenForm.controls['CustomerName'].clearValidators();
			   this.invalidCustCode = true;
		   }
		   else{
			   this.invalidCustCode = false;
			   this.customerOnChange(event.target.value);
			   this.homeScreenForm.controls['CustomerName'].setErrors(null);
		   }

	   }
	   if(event.target.value ==''&& this.homeScreenForm.controls['ApplicationName'].value !=''){
			this.setHoldFlagOnAppChange();
		} 

	}


	// On Application Dropdown change.
	isChangeInApplication(event, flag :boolean= true) {
		this.AppCode = '';
		this.invalidAppName = false;
		this.invalidAppCode = false;
		this.invalidCustName = false;
		this.invalidCustCode = false;
		this.selectedClientID = 0;
		this.selectedAppID  = 0;
		 let appvalue=  (flag == true) ? event.option.value.applicationCode : event ;	
		for (let app of this.application) {
			if (app.applicationCode.toLowerCase() === appvalue.toLowerCase() || app.applicationName.toLowerCase() === appvalue.toLowerCase()) {
				this.selectedAppID = app.applicationID;
				this.selectedClientID = app.clientID;
				this.homeScreenForm.controls['ApplicationCode'].setValue({ applicationCode: app.applicationCode });
				this.homeScreenForm.controls['ApplicationName'].setValue({ applicationName: app.applicationName });
				this.homeScreenForm.controls['DM'].setValue(app.dm);
				this.homeScreenForm.controls['EBPP'].setValue(app.ebpp);
				this.homeScreenForm.controls['PDF'].setValue(app.pdf); 
			}
		}
		for (let name of this.customerNames) {
		
			if (name.customerId === this.selectedClientID) {
				this.selectedCustID = name.customerId;
				this.populateData(name);
			}

		}
		this.setHoldFlagOnAppChange();
	}

	setHoldFlagOnAppChange(){
		this.appChanged = false;
		this.AppCode = '';
		this.AppCodeList = [];
		for (let name of this.applicationArray) {
			if (name.applicationID === this.selectedAppID) {
				this.holdFlag = name.processingHold;
				if (this.holdFlag) {
					this.AppCode = name.applicationCode + " " + "on hold";
					break;
				}
			}
		}
		this.holdFlag = true;
	}

		//Validation for dropdown.
		validateApplicationNameAutoCompletes(event) {
			this.invalidCustName = false;
			this.invalidCustCode = false;
			this.invalidAppCode = false;
			this.invalidAppName = false;
			let  filterApplication: any = (event.target.value != null && this.applicationArray.length > 0) ? 
			(this.applicationArray.find(app => app.applicationName.toLowerCase() === event.target.value.toLowerCase()) != undefined ? true : false)
			: false;
			if(event.target.value ==''){
				this.clearApplicationValuesAndErrors();
				this.AppCode = '';
			}
			else if(event.target.value.length > 0){
				if(!filterApplication){
					this.homeScreenForm.controls['ApplicationName'].setErrors({'incorrect': true});
					this.homeScreenForm.controls['ApplicationCode'].setValue("");
					this.clearFormData();
					this.homeScreenForm.controls['ApplicationCode'].clearValidators();
					this.invalidAppName = true;
				}
				else {
					this.invalidAppName = false;
					this.homeScreenForm.controls['ApplicationName'].clearValidators();
					this.isChangeInApplication(this.appName.nativeElement.value,false);
				}
			}
			if(event.target.value =='' && this.homeScreenForm.controls['CustomerName'].value !=''){
				this.setHoldFlagOnCustChange();
			}
		}

		clearApplicationValuesAndErrors(){
			//clear values.
			this.homeScreenForm.controls['ApplicationName'].setValue("");
			this.homeScreenForm.controls['ApplicationCode'].setValue("");

			//clear validators.
			this.homeScreenForm.controls['ApplicationName'].clearValidators();
			this.homeScreenForm.controls['ApplicationCode'].clearValidators();
			
		}
	
		//Validation for dropdown.
		validateApplicationCodeAutoCompletes(event) {
			this.invalidCustName = false;
			this.invalidCustCode = false;
			this.invalidAppCode = false;
			this.invalidAppName = false;
			let  filterApplication: any = (event.target.value != null && this.applicationArray.length > 0) ? 
			(this.applicationArray.find(app => app.applicationCode.toLowerCase() === event.target.value.toLowerCase()) != undefined ? true : false)
			: false;
			if(event.target.value ==''){
				this.clearApplicationValuesAndErrors();
				this.AppCode = '';
			}
			else if(event.target.value.length > 0){
				if(!filterApplication){
					this.homeScreenForm.controls['ApplicationCode'].setErrors({'incorrect': true});
					this.homeScreenForm.controls['ApplicationName'].setValue("");
					this.clearFormData();
					this.homeScreenForm.controls['ApplicationName'].clearValidators();
					this.invalidAppCode = true;
				}
				else {
					this.invalidAppCode = false;
					this.homeScreenForm.controls['ApplicationCode'].clearValidators();
					this.isChangeInApplication(this.appCode.nativeElement.value,false);
				}
			}
			if(event.target.value =='' && this.homeScreenForm.controls['CustomerName'].value !=''){
				this.setHoldFlagOnCustChange();
			}
		}

		
	//key press amount for pieces.
	validateIntegers(key) {
		var keycode = (key.which) ? key.which : key.keyCode;
		if (keycode < 48 || keycode > 57) {
			return false;
		}
		else {
			return true;
		}
	}

	// On Customer button Click
	openCustomerScreen() {
		if (this.ValidateCustomer()) {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.height = "600px";
			dialogConfig.maxWidth = "91vw";
			dialogConfig.data = {
				title: "Customer",
				customerName: this.selectedCustomerName,
				customerCode: this.selectedCustomerCode,
				customerID: this.selectedCustID,
				customerFromHome: true
			};
			const dialogRef = this.dialog.open(AddcustomerComponent, dialogConfig);

			dialogRef.afterClosed().subscribe(cId => {
				if (cId) {					
					this.loadCustomerDataWhenDialogClosed(cId);					
				}
			});
		}
	}

	async loadCustomerDataWhenDialogClosed(cId:number){
		await this.customerservice.getCustomerById(cId).subscribe(res => {
			if (!res) { return };
			res = res[0];
			this.populateData(res);
			this.loadCustomerList();
		});
	}
	
 
// On Application button Click
	openApplicationScreen() {
		if(this.invalidCustName || this.invalidCustCode || this.invalidAppName || this.invalidAppCode || this.validateApplicationForCustomer()){
			this.popupService.openAlertDialog('Please enter valid data. ', "Home", "check_circle",false);
		} 
		else if ((!(this.homeScreenForm.get('ApplicationName').value)) || (!(this.homeScreenForm.get('ApplicationCode').value) || ((this.homeScreenForm.get('ApplicationName').value === -1)) || ((this.homeScreenForm.get('ApplicationCode').value === -1)))) {
			this.popupService.openAlertDialog("Please select either Application Name or Application Code.", "Home", "check_circle");
		}
		else {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = false;
			dialogConfig.height = "710px";
			dialogConfig.data = {
				applicationID: this.selectedAppID,
				title: "Application",
				editApplicationDialogShow: true,
			};
			const dialogRef = this.dialog.open(AddApplicationNewComponent, dialogConfig);

			dialogRef.afterClosed().subscribe(appId => {
				if (appId) {					
					this.loadApplicationDataWhenDialogClosed(appId);					
				}
			});
		}
	}

	loadApplicationDataWhenDialogClosed(appId){
	 this.applicationservice.getApplicationByID(appId).subscribe(app => {
		if (!app) { return };
		this.loadCustomerList();
		this.isCount=this.isCount+1;
		this.loadApplicationList();
		
		
		this.homeScreenForm.controls['DM'].setValue(app[0].dm);
		this.homeScreenForm.controls['EBPP'].setValue(app[0].ebpp);
		this.homeScreenForm.controls['PDF'].setValue(app[0].pdf);  
	});
}

	// On Service Agreement button Click
	openServiceAgreement() {
		if (this.ValidateCustomer()) {
			const servicedialog = new MatDialogConfig();
			servicedialog.disableClose = true;
			servicedialog.autoFocus = true;	
			servicedialog.width = "1500px";
			servicedialog.data = {
				title: "Service Agreement",
				customerName: this.custName.nativeElement.value.trim(),
				customerCode:  this.custCode.nativeElement.value.trim(),
				customerID:	this.selectedCustID ,
				btndisableFromHome: true,
			};
			const servicedialogConfig = this.dialog.open(ServiceAgreementDialogComponent, servicedialog);	
			
		}
	}


	 // On row double click navigate to postage
		openPostageScreen(row: Postage) {
		this.setLocalstorageData("Jobs");
		let runDate :any = row.runDate;
		if(runDate){
			runDate=runDate.toString().split('/')
			runDate=runDate.join('-')
		  }
		else{
			runDate = '00-00-00';
		}
		this.router.navigate(['./update_postages', row.inputName,runDate, row.recordID]);
	}

	//calling contact from home
	openContactDialog() {
		if (this.ValidateCustomer()) {
			const contactDialogConfig = new MatDialogConfig();
			contactDialogConfig.disableClose = true;
			contactDialogConfig.autoFocus = true;
			contactDialogConfig.maxWidth =  "90vw";
			contactDialogConfig.data = {
				title: "Contacts",
				customerName:this.custName.nativeElement.value.trim(),
				customerCode :  this.custCode.nativeElement.value.trim(),
				customerID: this.selectedCustID ,
				customerTelephone : this.homeScreenForm.controls['Telephone'].value ,
				customerFromHome: true,
				customerReadPrivilege:false,
				customerUpdatePrivilege:false, 

			};
	
			const dialogRef = this.dialog.open(ContactDialogComponent, contactDialogConfig);
		
		
		}
	} 

	//Open Inserts Screen.
	openInsert(row,insertName,insertNumber) {
		this.setLocalstorageData("Inerts");
		let insertType=insertName+insertNumber.toString();
		this.currentDate = new Date();
 
		let startDate=(this.homeScreenForm.get('startDate').value =="" || this.homeScreenForm.get('startDate').value ==null)?this.datepipe.transform(new Date(this.currentDate.setDate(this.currentDate.getDate() - 30)),MessageConstants.DATEFORMAT).toString():
		this.homeScreenForm.get('startDate').value;
		
		let endDate=(this.homeScreenForm.get("endDate").value =="" || this.homeScreenForm.get("endDate").value ==null)? this.datepipe.transform(new Date(),  MessageConstants.DATEFORMAT).toString():this.homeScreenForm.get("endDate").value ;
		
		if(startDate){
			startDate=startDate.split('/')
			startDate=startDate.join('-')
		  }else{
			startDate="00-00-00"
		  }
		  if(endDate){
			endDate=endDate.split('/')
			endDate=endDate.join('-')
		  }
		  else{
			endDate="00-00-00"
		  }
		this.router.navigate(['./add_insert', row.applicationID,insertType,startDate,endDate]);
	}

	//Scroll to Inserts
	scrollToDownInserts() {
		this.matCardContentMoveSmoothInserts.nativeElement.scrollIntoView({ behavior: "smooth" });
	}

	// To Validate Customer
	ValidateCustomer(): boolean {
		if ((!(this.homeScreenForm.get('CustomerCode').value)) || (!(this.homeScreenForm.get('CustomerName').value)) || ((this.homeScreenForm.get('CustomerName').value === -1)) || ((this.homeScreenForm.get('CustomerCode').value === -1))) {
			this.popupService.openAlertDialog("Please select either Customer Name or Customer Code.", "Home", "check_circle");
			return this.isvalid = false;
		}
		return this.isvalid = true;
	} 

	//set focus.
	setFocus() {
		setTimeout(() => {
			this.stDateFocus.nativeElement.focus();
		}, 0);
	}
	
	//Set start date to control.
	addStartEvent(event) {
		var todaysDate = new Date(this.homeScreenForm.controls['startDateWithPicker'].value);
		this.startOfEndDate = todaysDate;
		let currentDate = this.datepipe.transform(todaysDate,MessageConstants.DATEFORMAT).toString();
		this.homeScreenForm.controls['startDate'].setValue(currentDate);
		this.setFocus();
	}

	

	//Set end date to control.
	addEndEvent(event) {
		var todaysDate = new Date(this.homeScreenForm.controls['endDateWithPicker'].value);
		let currentDate = this.datepipe.transform(todaysDate,MessageConstants.DATEFORMAT).toString();
		this.homeScreenForm.controls['endDate'].setValue(currentDate);	
		this.setFocus();
	}

	//Set end date to datepicker.
	setDateInDatePicker(controlName1, controlName2) {
		let dateToSet: any = new Date(this.homeScreenForm.controls[controlName1].value);
		if(this.homeScreenForm.controls['startDate'].value!="" &&this.homeScreenForm.controls['startDate'].value!=null && (this.homeScreenForm.controls['startDateWithPicker'].value !='Invalid Date' &&
		this.homeScreenForm.controls['startDateWithPicker'].value =="")){
			this.startOfEndDate = dateToSet;
		}
		if (dateToSet == "Invalid Date" || this.homeScreenForm.controls[controlName1].value == null || this.homeScreenForm.controls[controlName1].value == ""){/*  || dateToSet<this.homeScreenForm.get('startDate').value */
			this.homeScreenForm.controls[controlName2].setValue("");
		}
		else{
			this.homeScreenForm.controls[controlName2].setValue(dateToSet);
			let date = this.datepipe.transform(this.homeScreenForm.controls[controlName2].value,MessageConstants.DATEFORMAT).toString();
			this.homeScreenForm.controls[controlName1].setValue(date);
		}
		
	}
	//setData to localstorage
	setLocalstorageData(fromGrid) {
		const homeFormData = this.homeScreenForm.value;
		let currentDate = new Date();
		if(homeFormData.startDate == null && homeFormData.endDate == null){
			homeFormData.startDate = this.datepipe.transform(new Date(currentDate.setDate(currentDate.getDate()-30)),MessageConstants.DATEFORMAT).toString();
			homeFormData.endDate = this.datepipe.transform(new Date(), MessageConstants.DATEFORMAT).toString();
		}
		homeFormData.insertPanel = this.isInsertsResultsPanelOpen;
		homeFormData.jobresultsPanel = this.jobsDataPanelOpenState;
		homeFormData.fromGrid = fromGrid;
		homeFormData.clientID = this.selectedCustID;
		homeFormData.AppCode = this.AppCode;
		homeFormData.holdFlag = this.holdFlag;
		
		this.application = [];
		for (let apps of this.applicationArray) {
		
			if (apps.clientID == this.selectedCustID) {
			
				this.application.push(apps);
				this.appChanged = true;
			}
		}  
		homeFormData.appChanged = this.appChanged;
		homeFormData.application = this.application; 
		localStorage.setItem("homeData", JSON.stringify(homeFormData));
	}

	// On Reset button click
	resetForm() {
		this.resetFormData();
		this.highlightedRows.pop();
		this.currentDate = new Date();
		this.holdFlag = false;
		this.AppCode = '';
		this.jobsDataSource = new MatTableDataSource<Postage>();
		this.insertsDataSource = new MatTableDataSource<Inserts>();
		this.insertsDataSource.data = [];
		this.isTableHasData = true;
		this.isTableHasDataForInserts = true;
		this.initializeAutocompleteCustomer();
		this.AppCodeList = [];
		this.isInsertsResultsPanelOpen = false;
		this.jobsDataPanelOpenState = false;
		this.isInsertsClicked = false;
		this.appChanged = false;
		this.application = [];
		this.isCount = 1;
		this.loadApplicationList();
	}

	//reset data.
	resetFormData() {
		this.clearFormData();
		this.homeScreenForm.controls['CustomerName'].setValue("");
		this.homeScreenForm.controls['CustomerCode'].setValue("");
		this.homeScreenForm.controls['ApplicationName'].setValue("");
		this.homeScreenForm.controls['ApplicationCode'].setValue("");
		this.homeScreenForm.controls['endDate'].setValue(null);
		this.homeScreenForm.controls['startDate'].setValue(null);
		this.homeScreenForm.controls['endDateWithPicker'].setValue(null);
		this.homeScreenForm.controls['startDateWithPicker'].setValue(null);
		this.startOfEndDate = null;
		this.selectedCustomerName = null;
		this.selectedCustomerCode = null;
	    this.appName.nativeElement.value = null;
		this.appCode.nativeElement.value = null;
		this.selectedCustID = 0;
		this.invalidEndDate = false;
		this.fromHome = true;
		this.invalidAppCode = false;
		this.invalidAppName = false;
		this.invalidCustCode = false;
		this.invalidCustName = false;
		Object.keys(this.homeScreenForm.controls).forEach(key => {
			this.homeScreenForm.controls[key].setErrors(null)
		});
	

	}

	clearFormData(){
		this.homeScreenForm.controls['Telephone'].setValue("");
		this.homeScreenForm.controls['Fax'].setValue("");
		this.homeScreenForm.controls['IVRPhoneNumber'].setValue("");
		this.homeScreenForm.controls['IVRPhoneNumber'].setValue("");
		this.homeScreenForm.controls['comments'].setValue("");
		this.homeScreenForm.controls['DM'].setValue(null);
		this.homeScreenForm.controls['EBPP'].setValue(null);
		this.homeScreenForm.controls['IVR'].setValue(null);
		this.homeScreenForm.controls['PDF'].setValue(null);
		this.homeScreenForm.controls['MailerID'].setValue(null);
		this.homeScreenForm.controls['CRID'].setValue(null);
		this.holdFlag = false;
		this.AppCode = '';
	}

	// To Select the table Row
	selectRow(row) {
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
	}

	// To move Scroll bar on Click
	scrollToDown() {
		this.matCardContentMoveSmooth.nativeElement.scrollIntoView({ behavior: "smooth" });
	}

	getScreenList(){
		this.userPrivilegesService.getLoginUserPrivilegedScreens().subscribe(res=>{
		});
	}
	convertToCustomDate(pDate){
		return CustomDateConvertor.dateConvertor(pDate);
	}
	
	public hasError = (controlName: string, errorName: string) => {
		
		return this.homeScreenForm.controls[controlName].hasError(errorName);
	}
	
}




