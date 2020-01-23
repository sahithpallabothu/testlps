import { MatSort,MatSelect, MatTableDataSource, ErrorStateMatcher } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Application } from '@/businessclasses/Application/application';
import { PrintLocation } from '@/businessclasses/Application/location';
import { SpaceValidator } from '@/shared/spaceValidator';
import { Router, ActivatedRoute } from '@angular/router';
import { StatesService } from '../../../businessservices/admin/states.service';
import { ApplicationService } from '../../../businessservices/application/application.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { Flagtype } from '../../../businessclasses/admin/flagtype';
import { FlagtypeService } from '../../../businessservices/admin/flagtype.service';
import { Perfpatterns } from '../../../businessclasses/admin/perfpatterns';
import { PerfpatternsService } from '../../../businessservices/admin/perfpatterns.service';
import { SizeService } from '../../../businessservices/admin/size.service';
import { SoftwareService } from '../../../businessservices/admin/software.service';
import { Size } from '../../../businessclasses/admin/size';
import { AddcustomerComponent } from '@/businesscomponents/Customer/addcustomer/addcustomer.component';//lalitha
import { CustomerService } from '@/businessservices/customer/customer.service';
import { Customer,HeldType } from '@/businessclasses/Customer/customer';
import { States } from '@/businessclasses/admin/states';
import { Software } from '@/businessclasses/admin/software';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { Apptype } from '../../../businessclasses/admin/apptype';
import { ApptypeService } from '../../../businessservices/admin/apptype.service';
import { MessageConstants } from '@/shared/message-constants';
import { Notification } from '../../../businessclasses/Application/notification';
import { NotificationsDialogComponent } from '@/businesscomponents/Application/notifications-dialog/notifications-dialog.component';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { Config } from '@/businessclasses/Application/config';
import { HostListener } from '@angular/core';



@Component({
	selector: 'app-add-application-new',
	templateUrl: './add-application-new.component.html',
	styleUrls: ['./add-application-new.component.css']
})
export class AddApplicationNewComponent implements OnInit {
	filteredCustomer: Observable<Customer[]>;
	tableColumns: string[] = ['address1', 'address2', 'city', 'state', 'zip', 'shipmentMethod', 'update', 'delete'];
	showScrrenCancelBtn: boolean = true;
	editApplicationDialog: boolean = false;
	title: string;
	customerList: Observable<Customer[]>;
	customerNames: Customer[] = [];
	customerArray = [];
	statesArray: States[] = []
	//to store all the exixsting applications
	applicationArray = [];
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	applicationForm: FormGroup;
	errorMatcher = new ErrorMatcher();
	//to check whether we are adding or updating application
	isChangesExists: boolean = false;
	//to store the appl Id to be updated
	applicationIDToUpdate: number = -1;
	isvalid: boolean = false;
	//filtered option for customer name and customer code auto complete 
	filteredOptionsCustomer: Observable<Customer[]>;
	filteredOptionsCustomerCode: Observable<Customer[]>;
	allApptypes: Observable<Apptype[]>;
	allFlagtypes: Observable<Flagtype[]>;
	allPerfPatterns: Observable<Perfpatterns[]>;
	perfPatternArray: Perfpatterns[];
	allsizes: Observable<Size[]>;
	allLocations:Observable<PrintLocation[]>;
	allSoftwares:Observable<Software[]>;
	locationArray:PrintLocation[];
	sizeArray: Size[];
	flagArray: Flagtype[];
	appTypeArray: Apptype[];
	softwareArray : Software[];
	isDisabled: boolean = false;
	stockPanelOpenState: boolean;
	isPanelOpen: boolean;
	selectedCustID: number;
	//hide buttons when view Application as Dialog
	isHideAddBtns: boolean = true;
	hideViewCustomerButton: boolean = true;
	//Edit Application
	allApplications: Observable<Application[]>;
	applicationData = [];
	isAppNameView = false;
	//STID Values
	trackingSTID = "041"
	defaultSTID = "036"
	laser="";
	stidData:Config;
	showNotifications = false;
	dataSource = new MatTableDataSource<Notification>();
	heldAddressLsit: any = [];
	modifiedHeldAddresslist: any = [];
	selectedstate = '';
	NotificationPanelOpenState = false;
	HeldPanelOpenState = false;
	shipmentSelected = '';
	isTableHasData = false;
	notificationsTableColumn: string[] = ['contactname',  'filehasbeenreceived', 'emailrmttocustomer', 'emailcode1reporttocustomer', 'pdfisready', 'jobhascompleted'  ];
	//highlightedRows
	highlightedRows = [];
	// send data to notification popup
	custName: string;
	custCode: string;
	appName: string;
	clientID: number;
	editMode: boolean=false;
	tIndex:number;
	appCode: string;
	Notification_Data: any;
	notificationFromHome: boolean;
	customername: string = "Starkville Utilities";
	fromCustomerScreen: boolean = false;
	fromEditCustomer: boolean = false;
	fromEditCustomerID: number;
	// notifications varaibles
	allNotifications: Observable<Notification[]>;
	notificationsDataSource = new MatTableDataSource<Notification>();
	@ViewChild(MatSort) notificationsSort: MatSort;
	applicationid: any;
	@ViewChild(MatSort) sort: MatSort;
	//to get the value from autocomplete
	@ViewChild('mState') mState: ElementRef;
	@ViewChild('custName') customerNameInAppl: ElementRef;
	@ViewChild('custCode') customerCodeInAppl: ElementRef;
	@ViewChild('appName') appNameInAppl: ElementRef;

	// To focus customer number section.
	@ViewChild('flag') flag: MatSelect;
	@ViewChild('appType') appType: MatSelect;
	@ViewChild('color') color: MatSelect;
	@ViewChild('customerID') customerID: ElementRef;


	options: string[] = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].sort();
	public selectedoption = "";
	applicationStates: Observable<States[]>;
	isStateDisabled: boolean = true;
	mailingStates: Observable<string[]>;
	physicalStates: Observable<string[]>;
	heldStates: Observable<string[]>;
	pysicalPanelOpenState = false;
	panelOpenState1: boolean = false;
	panelOpenState2: boolean = false;
    hasScreenReadPriviledge: boolean = false;
    hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	hasCustomerReadPrivilege:boolean=false;
	isAllowSave : boolean = false;
	hideBackButton:boolean=true;
	heldAddressTypes : HeldType[] = [];
	invalidCustName : boolean = false;
	invalidCustCode  : boolean = false;
	applicationPristineData;
	isApplicationPristine:boolean=true;
	isApplicationFromCustomer:boolean=false;
	showInView: boolean = false;
	//shipment methods
	shipmentMethodOptions: string[] = ['USPS', 'UPS', 'Fedex', 'Priority', 'Next day air'].sort();
	shipmentMethods: Observable<string[]>;
	constructor(private formbulider: FormBuilder,
		private stateService: StatesService,
		private applicationservice: ApplicationService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private route: ActivatedRoute,
		private apptypeService: ApptypeService,
		private flagtypeservice: FlagtypeService,
		private perfpatternsService: PerfpatternsService,
		private sizeService: SizeService,
		private softwareService :SoftwareService,
		private router: Router,
		private userPrivilegesService: UserPrivilegesService,
		private customerservice: CustomerService,
		private dialog: MatDialog, private dialogRef: MatDialogRef<AddApplicationNewComponent>,
		public NotificationsDialogRef: MatDialogRef<NotificationsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data) {
		//Set Application screen privileges
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.applicationScreenName)) {
			this.hasScreenUpdatePriviledge = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.applicationScreenName)) {
			this.hasScreenInsertPriviledge = true;
		}
		if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.applicationScreenName)) {
			this.hasScreenReadPriviledge = true;
		}

		if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.customerScreenName)) {
			this.hasCustomerReadPrivilege = true;
		}
				//to load all the states in state control
				this.loadAllStates();
		
		if (data.editApplicationDialogShow) {
			this.editMode = data.editApplicationDialogShow;
			this.title = data.title;
			this.editApplicationDialog = true;
			this.showScrrenCancelBtn = false;
			//this.isDisabled = true;
			this.isHideAddBtns = false;
			this.hideViewCustomerButton = false;
			this.getApplicationById(data.applicationID);
		}

	}


	ngOnInit() {
		//to check if application Name Exist
		const checkApplicationName = () => {
			return (control: FormControl) => {
				let isExist: boolean;
				isExist = this.checkNameOfApplication();
				return isExist ? { 'isApplicationNameExist': true } : null;
			};
		}

		//to check if application Code Exist
		const checkApplicationCode = () => {
			return (control: FormControl) => {
				let isExist: boolean;
				isExist = this.checkCodeOfApplication();
				return isExist ? { 'isApplicationCodeExist': true } : null;
			};
		}

		
	

		//to check if State Exist
		const checkState = () => {
			return (control: FormControl) => {
				let isExist: boolean;
				isExist = this.checkStateOfApplication();
				return isExist ? null : { 'isStateExist': true };
			};
		}
		this.applicationForm = this.formbulider.group({
			applicationName: new FormControl('', [Validators.required, Validators.maxLength(50), checkApplicationName(), SpaceValidator.ValidateSpaces]),
			applicationCode: new FormControl('', [Validators.required, Validators.maxLength(4), checkApplicationCode(), SpaceValidator.ValidateSpaces]),
			customerName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
			customerCode: new FormControl('', [Validators.required, Validators.maxLength(255)]),
			customerState: new FormControl('', [Validators.required, Validators.maxLength(2), checkState()]),
			customerFlag: new FormControl('', [Validators.required]),
			customerID: new FormControl('', [Validators.required, Validators.maxLength(4)]),
			appType: new FormControl('', [Validators.required]),
			color: new FormControl('', [Validators.required]),
			processingHold: new FormControl(),
			holdReason: new FormControl('', [Validators.maxLength(50), SpaceValidator.ValidateSpaces]),
			active: new FormControl(true,[]),
			autoRun: new FormControl(),
			ebpp: new FormControl(),
			imbTracing: new FormControl(),
			//software: new FormControl('', [Validators.maxLength(255), SpaceValidator.ValidateSpaces]),
			software: new FormControl('', []),
			runFrequency: new FormControl(),
			printLocation: new FormControl('', [Validators.required]),
			endorsement: new FormControl(),
			pdf: new FormControl(),
			overlay: new FormControl(),
			backer: new FormControl(),
			paper: new FormControl('', [SpaceValidator.ValidateSpaces]),
			perf: new FormControl(),
			size: new FormControl(),
			duplex: new FormControl(),
			outsideEnvelope: new FormControl('', [Validators.maxLength(50), SpaceValidator.ValidateSpaces]),
			returnEnvelope: new FormControl('', [Validators.maxLength(50), SpaceValidator.ValidateSpaces]),
			printSide: new FormControl(),
			ancillaryBill: new FormControl(),
			detailBill: new FormControl(),
			invoiceBill: new FormControl(),
			itemizedBill: new FormControl(),
			multimeterBill: new FormControl(),
			municipalBill: new FormControl(),
			summaryBill: new FormControl(),
			mdm: new FormControl(),
			tdhud: new FormControl(),
			tva: new FormControl(),
			unBundled: new FormControl(),
			check: new FormControl(),
			delinquent: new FormControl(),
			thirdParty: new FormControl(),
			mailingAddress1: new FormControl(''),
			mailingAddress2: new FormControl(''),
			mailngCity: new FormControl(''),
			mailingState: new FormControl(''),
			mailingZipCode: new FormControl(''),
			physicalAddress1: new FormControl(''),
			physicalAddress2: new FormControl(''),
			physicalCity: new FormControl(''),
			physicalState: new FormControl(''),
			physicalZipCode: new FormControl(''),
			contactName: new FormControl(''),
			heldAddress1: new FormControl(''),
			heldAddress2: new FormControl(''),
			heldCity: new FormControl(''),
			heldAddressState: new FormControl(''),
			heldZipCode: new FormControl(''),
			shipmentMethod: new FormControl(''),
			//newly added
			heldContactNameOther: new FormControl(''),
			heldAddressOther1: new FormControl(''),
			heldAddressOther2: new FormControl(''),
			heldCityOther: new FormControl(''),
			heldAddressStateOther: new FormControl(''),
			heldZipCodeOther: new FormControl(''),
			heldShipmentMethodOther: new FormControl(''),
			checkHeld1TypeId: new FormControl(''),
			held2TypeId: new FormControl(''),
		});
		//to load all the states in state control
		this.loadAllStates();
		//to load all locations
		this.loadAllLocations();
		//to load All App Types
		this.loadAllApptypes();
		//to load all flags
		this.loadAllFlagtypes();
		//to load All Perf Patterns
		this.loadAllPerfPatterns();
		//to load All Sizes
		this.loadAllSizes();
		//to load all customers
		this.loadCustomerList();

		//to load all held types
 		this.loadheldAddressTypes();
		
		//to load allSoftware
		this.loadAllSoftware();
		
		 // To get application id, customer name and customer code when they came for edit application or the application came from customers screen.
		this.applicationid = this.route.snapshot.paramMap.get('id');
		this.custName = this.route.snapshot.paramMap.get('name');
		this.custCode = this.route.snapshot.paramMap.get('code');
		if (this.route.snapshot.paramMap.get('custid') != null) {
			this.selectedCustID = parseInt(this.route.snapshot.paramMap.get('custid'));
			this.fromEditCustomerID = this.selectedCustID
		}

		
		// Add application.
		if (!this.editMode) {
			this.setFocus();
			this.tIndex=-1;
			this.disableAllControls();
			if(this.hasScreenInsertPriviledge && this.applicationid == null){
				this.isAllowSave=true;
			}else{
				this.disableAllControls();
				this.applicationForm.controls['customerCode'].disable();
				this.applicationForm.controls['customerName'].disable();
			}
		}
		if(this.editMode){
			this.setFocusToAppName();
			this.tIndex=0;
		}

		// From Customer screen
		if (this.custName != null) {
			this.fromEditCustomer = true;
			this.applicationForm.controls['customerCode'].setValue({ customerCode: this.custCode });
			this.applicationForm.controls['customerName'].setValue({ customerName: this.custName });
			this.applicationForm.controls['customerCode'].disable();
			this.applicationForm.controls['customerName'].disable();
			localStorage.setItem("navigatedFromCustomer", JSON.stringify(-1));
			this.isApplicationFromCustomer = true;
			this.enableAllControls();
			this.setFocusToAppName();
			if(this.hasScreenInsertPriviledge){
				this.isAllowSave=true;
			}
			else{
				this.disableAllControls();
			}
		}
		 
		/*If application is navigated from view application screen */
		if (this.applicationid != null) {
			this.applicationForm.controls['customerName'].disable();
			this.applicationForm.controls['customerCode'].disable();
			this.showInView = true;
			this.enableAllControls();
			if(this.hasScreenUpdatePriviledge){
				this.isAllowSave=true;
			}else{
				this.disableAllControls();
			}
			this.getApplicationById(this.applicationid);
			
			if(localStorage.getItem("navigatedFromCustomer")==this.applicationid){
				this.hideBackButton=false;
			}
		}

		

		//to check whether application name or application code already exist
		this.loadAllApplications();

		//To load the config data if exist.
		this.loadConfigData();
		

		this.mailingStates = this.applicationForm.controls['mailingState'].valueChanges.pipe(
			startWith(''),
			map(value => this._filter(value))
		);
		this.physicalStates = this.applicationForm.controls['physicalState'].valueChanges.pipe(
			startWith(''),
			map(value1 => this._filter(value1))
		);
		this.heldStates = this.applicationForm.controls['heldAddressState'].valueChanges.pipe(
			startWith(''),
			map(value2 => this._filter(value2))
		);


		//To sort based on table header.
		this.notificationsDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};	
	}

	//load all heldAddressTypes
	loadheldAddressTypes() {
		this.customerservice.getHeldTypes().subscribe(results => {
			this.heldAddressTypes = results;
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

     ngAfterContentInit() {
		if (!this.editMode) {
			
		}
	 }


	setFocus() {
		setTimeout(() => {
			this.customerNameInAppl.nativeElement.focus();
		}, 0);
	}
	setFocusToAppName(){
		setTimeout(() => {
			this.appNameInAppl.nativeElement.focus();
		}, 0);
	}
	
	//Set Y or N for notifications
	setValueForNotificationCheckBox(value){
		if(value){
			return 'Y';
		}
		else{
			return 'N';
		}
	}

	//load all the states from backend
	async loadAllStates() {
		await this.stateService.getAllStates().subscribe(results => {
			this.statesArray = results;
			this.statesArray.sort((a, b) => (a.stateCode > b.stateCode) ? 1 : ((b.stateCode > a.stateCode) ? -1 : 0));
			if(this.editMode){
				for (let item of this.statesArray) {
					if (this.applicationData[0] && item.stateCode === this.applicationData[0].customerState) {
						this.applicationForm.controls['customerState'].setValue(item);
					}
				}
			}
			if (this.statesArray.length > 0) {
				this.initializeStatesArray();
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}
	

	//to find if the entered state is valid
	isStateValid(){
		let isFound = false,tempListItem;
		for (let list of this.statesArray) {
			if (this.mState.nativeElement.value.toString() != '') {
				if (list.stateCode.toLowerCase().trim() === this.mState.nativeElement.value.toLowerCase().trim()) {
					isFound = true;
					tempListItem=list;
					break;
				} 
			} else {
				isFound = false;
			}
		}
		if(isFound){
			this.applicationForm.controls['customerState'].setValue(tempListItem);
			this.isChange('state')
		}else{
			this.applicationForm.controls['customerState'].setValue("");
		}
	}
	
	//to initialize states arry
	initializeStatesArray() {
		this.applicationStates = this.applicationForm.controls['customerState'].valueChanges
			.pipe(
				startWith<string | States>(''),
				map(value => typeof value === 'string' ? value : value.stateCode),
				map(stateCode => stateCode ? this._filterStates(stateCode) : this.statesArray.slice())
			);
	}

	//To filter states.
	private _filterStates(name: string): States[] {
		let filterState = name.toLowerCase();
		return this.statesArray.filter(option => option.stateCode.toLowerCase().indexOf(filterState) === 0);
	}

	displayFnStateCodes(stateCodeInStates?: States): string | undefined {
		return stateCodeInStates ? stateCodeInStates.stateCode : undefined;
	}
	//To check customer number exist or not.
	checkCustomerNumberExist():boolean{
		let isExist=false;
		let State=this.applicationForm.get('customerState').value;
		let Flag=this.applicationForm.get('customerFlag').value;
		let ID=""+this.applicationForm.get('customerID').value;
		let AppType=this.applicationForm.get('appType').value;
		let Color=""+this.applicationForm.get('color').value;
		for(;ID.length<3;){
			ID+='0'+ID;
		}
		if(typeof State =='object'){
		State=State.stateCode;
		}
		let presentCustomerNumber:string=State+Flag+ID+AppType+Color.substring(0,1);
		if(this.applicationIDToUpdate!=null){
			for(let i=0;i<this.applicationArray.length;i++){
				if(this.applicationIDToUpdate!=this.applicationArray[i].applicationID){
					if(presentCustomerNumber==this.applicationArray[i].customerNumber){
						
						isExist=true;
						break;
					}
				}
			}
		}else{
			for(let i=0;i<this.applicationArray.length;i++){
				if(presentCustomerNumber==this.applicationArray[i].customerNumber){
					isExist=true;
					break;
				}
			}
		}
		return isExist;
	}

	//to check if application Name already Exist
	checkNameOfApplication() {
		let isExist: boolean;
		if(this.applicationArray.length!=0){
			for (let list of this.applicationArray) {
				if (this.applicationForm.get('applicationName').value !== null && this.applicationForm.get('applicationName').value !== "") {
					if (list.applicationName.toLowerCase().trim() === this.applicationForm.get('applicationName').value.toLowerCase().trim()) {
						isExist = true;
						break;
					}
				}
				else {
					isExist = false;
				}
			}
		}
		return isExist;
	}

	//to check if application code exist
	checkCodeOfApplication() {
		let isExist: boolean;
		if(this.applicationArray.length!=0){
            for (let list of this.applicationArray) {
				if (list.applicationCode.toLowerCase().trim() === this.applicationForm.get('applicationCode').value.toLowerCase().trim()) {
					isExist = true;
					break;
				} else {
					isExist = false;
				}
			}
		}
		return isExist;
	}

	//to check if state exist
	checkStateOfApplication() {
		let isExist: boolean;
		for (let list of this.statesArray) {
			if (this.mState.nativeElement.value.toString() != '') {
				if (list.stateCode.toLowerCase().trim() === this.mState.nativeElement.value.toLowerCase().trim()) {
					isExist = true;
					break;
				} else {
					isExist = false;
				}
			} else {
				isExist = true;
			}
		}
		return isExist;
	}

	private _filter(value: string): string[] {
		let filterValue_name: string;
		if (value) {
			filterValue_name = value.toLowerCase();
		} else {
			filterValue_name = value;
		}

		return this.options.filter(option => option.toLowerCase().indexOf(filterValue_name) === 0);
	}

	async getApplicationById(ApplicationID) {
		this.allApplications = await this.applicationservice.getApplicationByID(ApplicationID);
		this.allApplications.subscribe(results => {
			if (!results) { return };
			this.applicationData = results;
			this.loadApplicationList(this.applicationData);
			this.loadAllApplications();
		},
			(error) => {
				this.errorService.handleError(error);
			});

			
	}
	disableAddressControls(){
		this.applicationForm.controls['mailingAddress1'].disable();
		this.applicationForm.controls['mailingAddress2'].disable();
		this.applicationForm.controls['mailngCity'].disable();
		this.applicationForm.controls['mailingState'].disable();
		this.applicationForm.controls['mailingZipCode'].disable();
		this.applicationForm.controls['physicalAddress1'].disable();
		this.applicationForm.controls['physicalAddress2'].disable();
		this.applicationForm.controls['physicalCity'].disable();
		this.applicationForm.controls['physicalState'].disable();
		this.applicationForm.controls['physicalZipCode'].disable();
		this.applicationForm.controls['contactName'].disable();
		this.applicationForm.controls['heldAddress1'].disable();
		this.applicationForm.controls['heldAddress2'].disable();
		this.applicationForm.controls['heldCity'].disable();
		this.applicationForm.controls['heldAddressState'].disable();
		this.applicationForm.controls['heldZipCode'].disable();
		this.applicationForm.controls['shipmentMethod'].disable();
		this.applicationForm.controls['heldContactNameOther'].disable();
		this.applicationForm.controls['heldAddressOther1'].disable();
		this.applicationForm.controls['heldAddressOther2'].disable();
		this.applicationForm.controls['heldCityOther'].disable();
		this.applicationForm.controls['heldAddressStateOther'].disable();
		this.applicationForm.controls['heldZipCodeOther'].disable();
		this.applicationForm.controls['heldShipmentMethodOther'].disable();
		this.applicationForm.controls['checkHeld1TypeId'].disable();
		this.applicationForm.controls['held2TypeId'].disable();
	}

	disableAllControls() {
		this.isDisabled = true;
		this.applicationForm.controls['applicationName'].disable();
		this.applicationForm.controls['applicationCode'].disable();
		this.applicationForm.controls['customerState'].disable();
		this.applicationForm.controls['customerFlag'].disable();
		this.applicationForm.controls['customerID'].disable();
		this.applicationForm.controls['appType'].disable();
		this.applicationForm.controls['software'].disable();
		this.applicationForm.controls['runFrequency'].disable();
		this.applicationForm.controls['printLocation'].disable();
		this.applicationForm.controls['endorsement'].disable();
		this.applicationForm.controls['paper'].disable();
		this.applicationForm.controls['perf'].disable();
		this.applicationForm.controls['size'].disable();
		this.applicationForm.controls['holdReason'].disable();
		this.applicationForm.controls['color'].disable();
		this.applicationForm.controls['outsideEnvelope'].disable();
		this.applicationForm.controls['returnEnvelope'].disable();
		this.applicationForm.controls['unBundled'].disable();
		this.applicationForm.controls['thirdParty'].disable();
		this.applicationForm.controls['ancillaryBill'].disable();
		this.applicationForm.controls['invoiceBill'].disable();
		this.applicationForm.controls['active'].disable();
		this.applicationForm.controls['multimeterBill'].disable();
		this.applicationForm.controls['pdf'].disable();
		this.applicationForm.controls['duplex'].disable();
		this.applicationForm.controls['detailBill'].disable();
		this.applicationForm.controls['municipalBill'].disable();
		this.applicationForm.controls['summaryBill'].disable();
		this.applicationForm.controls['check'].disable();
		this.applicationForm.controls['delinquent'].disable();
		this.applicationForm.controls['itemizedBill'].disable();
		this.applicationForm.controls['mdm'].disable();
		this.applicationForm.controls['tva'].disable();
		this.applicationForm.controls['tdhud'].disable();
		this.applicationForm.controls['overlay'].disable();
		this.applicationForm.controls['backer'].disable();
		this.applicationForm.controls['imbTracing'].disable();
		this.applicationForm.controls['ebpp'].disable();
		this.applicationForm.controls['processingHold'].disable();
		this.applicationForm.controls['autoRun'].disable();
		this.applicationForm.controls['printSide'].disable();
		this.applicationForm.controls['mailingAddress1'].disable();
		this.applicationForm.controls['mailingAddress2'].disable();
		this.applicationForm.controls['mailngCity'].disable();
		this.applicationForm.controls['mailingState'].disable();
		this.applicationForm.controls['mailingZipCode'].disable();
		this.applicationForm.controls['physicalAddress1'].disable();
		this.applicationForm.controls['physicalAddress2'].disable();
		this.applicationForm.controls['physicalCity'].disable();
		this.applicationForm.controls['physicalState'].disable();
		this.applicationForm.controls['physicalZipCode'].disable();
		this.applicationForm.controls['contactName'].disable();
		this.applicationForm.controls['heldAddress1'].disable();
		this.applicationForm.controls['heldAddress2'].disable();
		this.applicationForm.controls['heldCity'].disable();
		this.applicationForm.controls['heldAddressState'].disable();
		this.applicationForm.controls['heldZipCode'].disable();
		this.applicationForm.controls['shipmentMethod'].disable();
		this.applicationForm.controls['heldContactNameOther'].disable();
		this.applicationForm.controls['heldAddressOther1'].disable();
		this.applicationForm.controls['heldAddressOther2'].disable();
		this.applicationForm.controls['heldCityOther'].disable();
		this.applicationForm.controls['heldAddressStateOther'].disable();
		this.applicationForm.controls['heldZipCodeOther'].disable();
		this.applicationForm.controls['heldShipmentMethodOther'].disable();
		this.applicationForm.controls['checkHeld1TypeId'].disable();
		this.applicationForm.controls['held2TypeId'].disable();
	}
	

	enableAllControls() {
        this.isDisabled = false;
		this.applicationForm.controls['applicationName'].enable();
		this.applicationForm.controls['applicationCode'].enable();
		this.applicationForm.controls['customerState'].enable();
		this.applicationForm.controls['customerFlag'].enable();
		this.applicationForm.controls['customerID'].enable();
		this.applicationForm.controls['appType'].enable();
		this.applicationForm.controls['software'].enable();
		this.applicationForm.controls['runFrequency'].enable();
		this.applicationForm.controls['printLocation'].enable();
		this.applicationForm.controls['endorsement'].enable();
		this.applicationForm.controls['paper'].enable();
		this.applicationForm.controls['perf'].enable();
		this.applicationForm.controls['size'].enable();
		this.applicationForm.controls['color'].enable();
		this.applicationForm.controls['outsideEnvelope'].enable();
		this.applicationForm.controls['returnEnvelope'].enable();
		this.applicationForm.controls['unBundled'].enable();
		this.applicationForm.controls['thirdParty'].enable();
		this.applicationForm.controls['ancillaryBill'].enable();
		this.applicationForm.controls['invoiceBill'].enable();
		this.applicationForm.controls['active'].enable();
		this.applicationForm.controls['multimeterBill'].enable();
		this.applicationForm.controls['pdf'].enable();
		this.applicationForm.controls['duplex'].enable();
		this.applicationForm.controls['detailBill'].enable();
		this.applicationForm.controls['municipalBill'].enable();
		this.applicationForm.controls['summaryBill'].enable();
		this.applicationForm.controls['check'].enable();
		this.applicationForm.controls['delinquent'].enable();
		this.applicationForm.controls['itemizedBill'].enable();
		this.applicationForm.controls['mdm'].enable();
		this.applicationForm.controls['tva'].enable();
		this.applicationForm.controls['tdhud'].enable();
		this.applicationForm.controls['overlay'].enable();
		this.applicationForm.controls['backer'].enable();
		this.applicationForm.controls['imbTracing'].enable();
		this.applicationForm.controls['ebpp'].enable();
		this.applicationForm.controls['processingHold'].enable();
		this.applicationForm.controls['autoRun'].enable();
		this.applicationForm.controls['printSide'].enable();
		this.loadAllStates();
		if(this.isApplicationPristine && !this.showInView && !this.isApplicationFromCustomer){ //
			this.applicationPristineData=this.buildApplicationObject();
			this.isApplicationPristine=false;
		}
		
	}

	//to load all existing applications to check whether application name or code already exist
	async loadAllApplications() {
		await this.applicationservice.getAllApplications().subscribe(results => {
			this.applicationArray = results;
		},
			(error) => {
				this.errorService.handleError(error);
			});

			
	}
	
	// to load config data if exist
	async loadConfigData(){
		await this.applicationservice.getConfigData().subscribe(results => {			
			this.stidData=results;
			if(this.stidData.defaultSTID!=null && this.stidData.defaultSTID!=''){
				this.defaultSTID=this.stidData.defaultSTID;
			}
			if(this.stidData.trackingSTID!=null && this.stidData.trackingSTID!=''){
				this.trackingSTID=this.stidData.trackingSTID;
			}
			if(this.stidData.laser!=null && this.stidData.laser!=''){
				this.laser=this.stidData.laser;
			}

			if(this.isApplicationPristine && !this.showInView && this.isApplicationFromCustomer){ 
				this.applicationPristineData=this.buildApplicationObject();
				this.isApplicationPristine=false;
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	async openCustomerDialog() {
		if ((!(this.applicationForm.get('customerCode').value)) || (!(this.applicationForm.get('customerName').value)) || (this.applicationForm.get('customerCode').value === -1) || (this.applicationForm.get('customerName').value === -1)) {
			this.popupService.openAlertDialog("Please select either Customer Name or Customer Code", "Application", "check_circle");
		}
		else {
			//ResetAddApplication();
			if (this.isChangesExists) {
				let isFieldsSame=true;
				const applicationData =this.buildApplicationObject();
				let promise = await new Promise((resolve, reject) => {
					isFieldsSame=this.isFieldsSame(applicationData);
					resolve();
				});
				if (!isFieldsSame) {
					const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
					if (userresponse === "ok") {
						this.isChangesExists = false;						
						this.openCustomerPopup();	
					}
				}else {
					this.isChangesExists = false;
					this.openCustomerPopup();	
				}
			} else {
				this.isChangesExists = false;
				this.openCustomerPopup();			
			}			
		}
	}

	openCustomerPopup() 
	{
		if (this.verifyCustomerNameandCode()) {
			const dialogConfigOfCustomer = new MatDialogConfig();
			dialogConfigOfCustomer.disableClose = true;
			dialogConfigOfCustomer.autoFocus = true;
			dialogConfigOfCustomer.height = "600px";
			dialogConfigOfCustomer.maxWidth = "91vw";
			dialogConfigOfCustomer.data = {
				title: "Customer",
				customerID: this.selectedCustID,
				customerFromHome: true,
			};
			const dialogRefOfCustomer = this.dialog.open(AddcustomerComponent, dialogConfigOfCustomer);

			dialogRefOfCustomer.afterClosed().subscribe(cid=>{
				if(cid){
					if(this.applicationIDToUpdate != -1){
						this.getApplicationById(this.applicationIDToUpdate);
					}
				}
			});
		}
	}

	public hasError = (controlName: string, errorName: string) => {
		return this.applicationForm.controls[controlName].hasError(errorName);
	}
	verifyCustomerNameandCode(): boolean {
		if (this.invalidCustCode == false && this.invalidCustName == false) {
			return this.isvalid = true;
		} else if (this.invalidCustName == false && this.invalidCustCode == true) {
			this.popupService.openAlertDialog("Invalid Customer Code", "Application", "check_circle",false);
			return this.isvalid = false;
		}
		else if (this.invalidCustCode == false && this.invalidCustName == true) {
			this.popupService.openAlertDialog("Invalid Customer Name", "Application", "check_circle",false);
			return this.isvalid = false;
		}
		else {
			this.popupService.openAlertDialog("Invalid Customer Name & Customer Code", "Application", "check_circle",false);
			return this.isvalid = false;
		}
	}
	async clearAddApplicationDialog() {
		if (this.isChangesExists) {
			let isFieldsSame=true;
			const applicationData =this.buildApplicationObject();
			let promise = await new Promise((resolve, reject) => {
				isFieldsSame=this.isFieldsSame(applicationData);
				resolve();
			});
				if (!isFieldsSame) {
					const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
					if (userresponse === "ok") {
						this.isChangesExists = false;						
						this.dialogRef.close(this.applicationIDToUpdate);
					}
				}else {
					this.isChangesExists = false;
					this.dialogRef.close(this.applicationIDToUpdate);
				}
		} else {
			this.isChangesExists = false;
			this.dialogRef.close(this.applicationIDToUpdate);
			
		}
		
	}

	//to check if any filed value is changed
	isChange(controlName: string) {
		this.isChangesExists = true;
		this.setFocusCustomerNumber(controlName);
	}
	setFocusCustomerNumber(controlName:string){
			switch(controlName){
				case 'customerState':
									setTimeout(() => {
										this.flag.focus();
									}, 0);  
									break;
				case 'customerFlag':
									setTimeout(() => {
										this.customerID.nativeElement.focus();
									}, 0);  		
						 			break;
				case 'appType':	
								setTimeout(() => {
									this.color.focus();
								}, 0); 
								 break;
				 default:
					          break;
			}
	}

	//load all App types in App Type Field
	loadAllApptypes() {
		this.allApptypes = this.apptypeService.getAllApptypes(false);
		this.allApptypes.subscribe(results => {
			if (!results) { return };
			this.appTypeArray = results;
			this.appTypeArray.sort((a, b) => (a.description.toLowerCase() > b.description.toLowerCase()) ? 1 : ((b.description.toLowerCase() > a.description.toLowerCase()) ? -1 : 0));

		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	// To Load FlagType data.
	loadAllFlagtypes() {
		this.allFlagtypes = this.flagtypeservice.getAllFlagtypes(false);
		this.allFlagtypes.subscribe(results => {
			if (!results) { return };
			this.flagArray = results;
			this.flagArray.sort((a, b) => (a.description.toLowerCase() > b.description.toLowerCase()) ? 1 : ((b.description.toLowerCase() > a.description.toLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.dispCustomErrorMessage("Could not get Flag Types - Please check your access rights.");
			});
	}
	//To load PerfPatterns data.
	loadAllPerfPatterns() {
		this.allPerfPatterns = this.perfpatternsService.getAllPerfPatterns(false);
		this.allPerfPatterns.subscribe(results => {
			if (!results) { return };
			this.perfPatternArray = results;
			this.perfPatternArray.sort((a, b) => (a.description.toLowerCase() > b.description.toLowerCase()) ? 1 : ((b.description.toLowerCase() > a.description.toLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	loadAllSizes() {
		this.allsizes = this.sizeService.getAllSize(false);
		this.allsizes.subscribe(results => {
			if (!results) { return };
			this.sizeArray = results;
			this.sizeArray.sort((a, b) => (a.size.toLowerCase() > b.size.toLowerCase()) ? 1 : ((b.size.toLowerCase() > a.size.toLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	loadAllLocations(){
		this.allLocations = this.applicationservice.getLocations();
		this.allLocations.subscribe(results => {
			if (!results) { return };
			this.locationArray = results;
			this.locationArray.sort((a, b) => (a.description.toLowerCase() > b.description.toLowerCase()) ? 1 : ((b.description.toLowerCase() > a.description.toLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	// To Load Software data.
	loadAllSoftware() {
		this.allSoftwares = this.softwareService.getAllSoftwares();
		this.allSoftwares.subscribe(results => {
			if (!results) { return };
			this.softwareArray = results;
			this.softwareArray.sort((a, b) => (a.software.toLowerCase() > b.software.toLowerCase()) ? 1 : ((b.software.toLowerCase() > a.software.toLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.dispCustomErrorMessage("Could not get Software - Please check your access rights.");
			});
	}

	buildApplicationObject(){
		const applicationData = this.applicationForm.value;
		applicationData.clientID = this.selectedCustID;
		applicationData.customerName = ""; //applicationData.customerName.customerName;
		applicationData.customerCode = ""; //applicationData.customerCode.customerCode;
		//for all boolean values default value should be true or false
		applicationData.processingHold = (applicationData.processingHold === null || applicationData.processingHold === "") ? false : applicationData.processingHold;
		applicationData.active = (applicationData.active === null || applicationData.active === "") ? false : applicationData.active;
		applicationData.autoRun = (applicationData.autoRun === null || applicationData.autoRun === "") ? false : applicationData.autoRun;
		applicationData.ebpp = (applicationData.ebpp === null || applicationData.ebpp === "") ? false : applicationData.ebpp;
		applicationData.imbTracing = (applicationData.imbTracing === null || applicationData.imbTracing === "") ? false : applicationData.imbTracing;
		//if imb tracing checked
		if (applicationData.imbTracing) {
			applicationData.stid = this.stidData['trackingSTID'];
		}
		//if not checked
		else if (!applicationData.imbTracing) {
			applicationData.stid = this.stidData['defaultSTID'];
		}
		if (applicationData.endorsement !== null && applicationData.endorsement !== undefined && applicationData.endorsement !== "-1") {
			applicationData.stid = applicationData.stid + applicationData.endorsement;
		}
		applicationData.customerState=this.mState.nativeElement.value;
		applicationData.pdf = (applicationData.pdf === null || applicationData.pdf === "") ? false : applicationData.pdf;
		applicationData.overlay = (applicationData.overlay === null || applicationData.overlay === "") ? false : applicationData.overlay;
		applicationData.backer = (applicationData.backer === null || applicationData.backer === "") ? false : applicationData.backer;
		applicationData.duplex = (applicationData.duplex === null || applicationData.duplex === "") ? false : applicationData.duplex;
		applicationData.ancillaryBill = (applicationData.ancillaryBill === null || applicationData.ancillaryBill === "") ? false : applicationData.ancillaryBill;
		applicationData.detailBill = (applicationData.detailBill === null || applicationData.detailBill === "") ? false : applicationData.detailBill;
		applicationData.invoiceBill = (applicationData.invoiceBill === null || applicationData.invoiceBill === "") ? false : applicationData.invoiceBill;
		applicationData.itemizedBill = (applicationData.itemizedBill === null || applicationData.itemizedBill === "") ? false : applicationData.itemizedBill;
		applicationData.multimeterBill = (applicationData.multimeterBill === null || applicationData.multimeterBill === "") ? false : applicationData.multimeterBill;
		applicationData.municipalBill = (applicationData.municipalBill === null || applicationData.municipalBill === "") ? false : applicationData.municipalBill;
		applicationData.summaryBill = (applicationData.summaryBill === null || applicationData.summaryBill === "") ? false : applicationData.summaryBill;
		applicationData.mdm = (applicationData.mdm === null || applicationData.mdm === "") ? false : applicationData.mdm;
		applicationData.tdhud = (applicationData.tdhud === null || applicationData.tdhud === "") ? false : applicationData.tdhud;
		applicationData.tva = (applicationData.tva === null || applicationData.tva === "") ? false : applicationData.tva;
		applicationData.unBundled = (applicationData.unBundled === null || applicationData.unBundled === "") ? false : applicationData.unBundled;
		applicationData.check = (applicationData.check === null || applicationData.check === "") ? false : applicationData.check;
		applicationData.delinquent = (applicationData.delinquent === null || applicationData.delinquent === "") ? false : applicationData.delinquent;
		applicationData.thirdParty = (applicationData.thirdParty === null || applicationData.thirdParty === "") ? false : applicationData.thirdParty;
		//for all select boxes which are null or "-1" assign null values to them
		applicationData.customerFlag = (applicationData.customerFlag === null || applicationData.customerFlag === "" || applicationData.customerFlag === -1) ? "" : applicationData.customerFlag;
		applicationData.appType = (applicationData.appType === null || applicationData.appType === ""|| applicationData.appType === -1) ? "" : applicationData.appType;
		applicationData.color = (applicationData.color === null ||applicationData.color === ""|| applicationData.color === "-1") ? "" : applicationData.color;
		applicationData.runFrequency = (applicationData.runFrequency === undefined ||applicationData.runFrequency === null ||applicationData.runFrequency === ""|| applicationData.runFrequency === -1) ? -1 : applicationData.runFrequency;
		applicationData.printSide = (applicationData.printSide === undefined ||applicationData.printSide === null || applicationData.printSide === -1 || applicationData.printSide==="" ? 0 : applicationData.printSide)
		//set int values to null
		applicationData.perf = (applicationData.perf === undefined || applicationData.perf === null ||applicationData.perf===""  ||applicationData.perf === -1) ? -1 : applicationData.perf;
		applicationData.size = (applicationData.size === undefined || applicationData.size === null || applicationData.size==="" || applicationData.size === -1) ? 0 : applicationData.size;
		applicationData.customerID = (applicationData.customerID === "" || applicationData.customerID === null ? -1 : applicationData.customerID)
		applicationData.software=(applicationData.software ? applicationData.software.toString() : null)
		//to set null values to ""
		applicationData.paper = (applicationData.paper === null ? "" : applicationData.paper)
		applicationData.endorsement = (applicationData.endorsement === null ? "" : applicationData.endorsement)
		if (this.applicationIDToUpdate != -1) {
			applicationData.clientID = this.clientID;
			applicationData.applicationID = this.applicationIDToUpdate;
		}
		
		return applicationData;
	}


	//redirection prevention.
	preventRedirection(){
		const applicationData =this.buildApplicationObject();
		if (this.isChangesExists) {
			if (this.applicationIDToUpdate != -1) {
				if (!this.isFieldsSame(applicationData)) {
					return false;
				}
				else{
					return true;
				}
			}else{
				this.applicationPristineData.clientID=applicationData.clientID;
				if(JSON.stringify(applicationData)!=JSON.stringify(this.applicationPristineData)){
					return false;
				}
				else{
					return true;
				}
			}
		}
		else{
			return true;
		}
	}


	//to save or update uplication data	
	async onFormSubmit() {
		const applicationData = this.buildApplicationObject();
		let responseText='';
		//to set customerId to -1 if empty 
		if (this.isChangesExists) {
			if(!this.checkCustomerNumberExist()) //To check for the duplicate customer number exist or not.
			{
				if (this.applicationIDToUpdate != -1) {
					applicationData.clientID = this.clientID;
					applicationData.applicationID = this.applicationIDToUpdate;
					//to check for dirtyFlag validation 
					if (!this.isFieldsSame(applicationData)) {
						 if((applicationData.processingHold && applicationData.holdReason) || !(applicationData.processingHold)){
							let isExist=this.checkActiveApplications();
							
							await isExist.then(function (result) {
								responseText = result;
							});
							if(responseText=='NoActiveApp'){
								if(!applicationData.active){
									let res=await this.getResponse();
									if(res){
										applicationData.clientActive=0;
									}
									else{
										applicationData.clientActive=1;
									}
								}
								this.updateApplication(applicationData);
							}
							else{ 
								applicationData.clientActive=1;
								if(responseText=='NoActiveCus' && applicationData.active){
								const dialogData=await this.popupService.openOkAlertDialog("Making this application active will also mark the customer as active.", "Application", "check_circle");
									this.updateApplication(applicationData);								
								}
								else{
									this.updateApplication(applicationData);
								}
							}
						 }else{
							this.popupService.openAlertDialog("Hold Reason is required.", "Application", "check_circle",false)
						 }
					}
					else {
						this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Edit Application", "check_circle",false)
					}
				}
				else {
					applicationData.applicationID =0;
					if((applicationData.processingHold && applicationData.holdReason) || !(applicationData.processingHold)){
						  this.createApplication(applicationData);
					}else{
						this.popupService.openAlertDialog("Hold Reason is required.", "Application", "check_circle",false)
					 }
				}
			}
			else{
				this.popupService.openAlertDialog("Customer Number Already Exist.", "Application", "check_circle",false)
			}
			
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Edit Application", "check_circle",false)
		}
	}

	//to check for dirtyFlag validation 
	isFieldsSame(applicationData) {
		
		let isFieldsSame = true;
		let array_disabledFields = ["applicationCode", "applicationName", "customerName", "customerCode", "heldAddress1",
			"heldAddress2", "heldAddressOther1", "heldAddressOther2", "heldAddressState", "heldAddressStateOther",
			"heldCity", "heldCityOther", "heldContactNameOther", "heldShipmentMethodOther", "heldZipCode", "heldZipCodeOther",
			"contactName", "shipmentMethod", "mailingAddress1", "mailingAddress2", "mailingState", "mailingZipCode",
			"mailngCity", "physicalAddress1", "physicalAddress2", "physicalCity", "physicalState", "physicalZipCode",
			"duplex","imbTracing", "endorsement","checkHeld1TypeId","held2TypeId",'dm','searchOption','searchText',"applicationID",
			"clientID"
		]

		let array_dropDowns = ["appType", "customerFlag", "color", "perf", "size", "runFrequency","printSide","software"]
		let array_dropDownsDifferent = ["printLocation"]
		let array_checkBoxes = ["stid"]
		let applicationObject = this.applicationData[0];
		for (let key in applicationObject) {
			//to skip checking dirtyFlag Validation for disabled Fields
			if (array_disabledFields.indexOf(key) >= 0) {
				continue;
			}
			//to check dirty flag validation for drop downs
			else if (array_dropDowns.indexOf(key) >= 0) {
				isFieldsSame = this.checkIsFieldsSameForDropDowns(key, applicationObject, applicationData);
				if (!isFieldsSame) {
					break;
				}
			}
			//to check dirty flag validation for imb tracing and endorsement
			else if (array_checkBoxes.indexOf(key) >= 0) {
				isFieldsSame = this.checkIsImbTracingSame(key, applicationObject, applicationData);
				if (!isFieldsSame) {
					break;
				}
			}
			//to check dirty flag validation for printLocation 
			else if (array_dropDownsDifferent.indexOf(key) >= 0) {
				isFieldsSame = this.checkIsprintLocationSame(key, applicationObject, applicationData);
				if (!isFieldsSame) {
					break;
				}
			}else{
                   //to check dirty flag validatio for other check boxes and text boxes
					for (let formControlName in applicationData) {
						if (key === formControlName) {
							if (applicationObject[key].toString() !== applicationData[formControlName].toString()) {
								isFieldsSame = false;
								break;
							}
						}
					}
			}
			if (!isFieldsSame) {
				break;
			}
		}
		return isFieldsSame;
	}

	//check if is fields are same for drop downs
	checkIsFieldsSameForDropDowns(key, applicationObject, applicationData) {
		let isFieldsSame = true;
		for (let formControlName in applicationData) {
			if (key === formControlName && formControlName!=="customerFlag") {
				if (formControlName === "perf" || formControlName === "size" || formControlName === "runFrequency") {
					if (applicationData[formControlName] === -1) {
						applicationData[formControlName] = null;
					}
				}
				if (applicationObject[key] != applicationData[formControlName]) {
					isFieldsSame = false;
					if (formControlName === "perf" || formControlName === "size" || formControlName === "runFrequency") {
						if (applicationData[formControlName] == null) {
							applicationData[formControlName] = -1;
						}
					}
					break;
				}
			}
			if(key === formControlName && formControlName==="customerFlag"){
				if (parseInt(applicationObject[key]) !== applicationData[formControlName]) {
					isFieldsSame = false;
					break;
				}
			}
		}
		return isFieldsSame;
	}

	//to check if imb tracing is same
	checkIsImbTracingSame(key, applicationObject, applicationData) {
		let isFieldsSame = true;
		if (applicationObject[key] !== applicationData["stid"]) {
			isFieldsSame = false;
		}
		return isFieldsSame;
	}

	//to check if print location is same
	checkIsprintLocationSame(key, applicationObject, applicationData) {
		let isFieldsSame = true;
		if (applicationObject[key] !== applicationData["printLocation"]) {
			isFieldsSame = false;
		}
		return isFieldsSame;
	}

	//method to create new application
	async createApplication(appData: Application) {
		this.applicationservice.createApplication(appData).subscribe(res => {
			if (res != null) {
				this.isChangesExists = false;
				this.NavigatetoEditApplication(parseInt(res['message']));
			}
			else {
				this.ResetChanges();
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//navigate the data to edit application
	async NavigatetoEditApplication(id: number) {
		await this.popupService.openOkAlertDialog(MessageConstants.SAVEMESSAGE, "Add Application", "check_circle",false);
		if(localStorage.getItem('navigatedFromCustomer')=='-1'){
			localStorage.setItem("navigatedFromCustomer", JSON.stringify(id));
		}
	
		await this.getEditApplicationById(id);
		this.isChangesExists = false;
	}
	//navigate to edit application screen
	//To navigate to edit customer screen.
	async getEditApplicationById(applicationID: any) {
		if (applicationID) {
			await this.router.navigate(['./add_application', applicationID]);
		}
		else {
			this.applicationForm.reset();
		}
	}


	//method to update application
	async updateApplication(appData: Application) {
		appData.applicationID = this.applicationIDToUpdate;
		appData.applicationName = this.appName;
		appData.applicationCode = this.appCode;
		this.applicationservice.updateApplication(appData).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Edit Application", "check_circle",false);
			this.getApplicationById(this.applicationIDToUpdate);
			this.applicationForm.controls['customerName'].enable();
			this.applicationForm.controls['customerCode'].enable();
			this.applicationForm.controls['applicationName'].enable();
			this.applicationForm.controls['applicationCode'].enable();
			this.isChangesExists = false;
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}

	//to restrict entering special chars in app name and app code
	omit_special_char(event)
	{   
	 var k;  
	 k = event.charCode;  //         k = event.keyCode;  (Both can be used)
	 return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
	}

	async ResetAddApplication() {
		const applicationData =this.buildApplicationObject();
		if (this.isChangesExists) {
			if (this.applicationIDToUpdate != -1) {
				if (!this.isFieldsSame(applicationData)) {
					const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
					if (response === "ok") {
						if (this.applicationIDToUpdate != -1) {
							await this.getApplicationById(this.applicationid);
							this.isChangesExists = false;
						}
						else {
							this.ResetChanges();
							
						}
					}
				}
				else{
					return true;
				}
			}
			else{
				this.applicationPristineData.clientID=applicationData.clientID;
				if(JSON.stringify(applicationData)!=JSON.stringify(this.applicationPristineData)){
					const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
					if (response === "ok") {
						this.ResetChanges();
					}
				}
				else{
					this.ResetChanges();
				}
				
			}
		}
		else {
			if (this.applicationIDToUpdate!=-1) {
				this.getApplicationById(this.applicationid);
			}else{
				this.ResetChanges();
			
			}

		}
	}

	//reset to initial data
	ResetChanges() {
		this.editMode = false;
		this.applicationIDToUpdate = -1;
		this.isChangesExists = false;
		this.clientID = null;
		this.custCode = null;
		this.appName = null;
		this.appCode = null;
		this.showInView = false;
		this.isAppNameView = false;
		this.showNotifications = false;
		this.isDisabled=false;
		this.applicationForm.controls['applicationName'].setValue("");
		this.applicationForm.controls['applicationCode'].setValue("");
		this.applicationForm.controls['customerState'].setValue("");
		this.applicationForm.controls['imbTracing'].setValue(false);
		this.applicationForm.controls['endorsement'].setValue("");
		this.applicationForm.controls['customerFlag'].setValue("");
		this.applicationForm.controls['customerID'].setValue("");
		this.applicationForm.controls['appType'].setValue("");
		this.applicationForm.controls['color'].setValue("");
		this.applicationForm.controls['software'].setValue("");
		this.applicationForm.controls['runFrequency'].setValue("");
		this.applicationForm.controls['printLocation'].setValue("");
		this.applicationForm.controls['paper'].setValue("");
		this.applicationForm.controls['perf'].setValue("");
		this.applicationForm.controls['size'].setValue("");
		this.applicationForm.controls['outsideEnvelope'].setValue("");
		this.applicationForm.controls['returnEnvelope'].setValue("");
		this.applicationForm.controls['unBundled'].setValue(false);
		this.applicationForm.controls['thirdParty'].setValue(false);
		this.applicationForm.controls['ancillaryBill'].setValue(false);
		this.applicationForm.controls['invoiceBill'].setValue(false);
		this.applicationForm.controls['active'].setValue(true);
		this.applicationForm.controls['multimeterBill'].setValue(false);
		this.applicationForm.controls['pdf'].setValue(false);
		this.applicationForm.controls['autoRun'].setValue(false);
		this.applicationForm.controls['duplex'].setValue(false);
		this.applicationForm.controls['detailBill'].setValue(false);
		this.applicationForm.controls['municipalBill'].setValue(false);
		this.applicationForm.controls['summaryBill'].setValue(false);
		this.applicationForm.controls['check'].setValue(false);
		this.applicationForm.controls['delinquent'].setValue(false);
		this.applicationForm.controls['itemizedBill'].setValue(false);
		this.applicationForm.controls['mdm'].setValue(false);
		this.applicationForm.controls['tva'].setValue(false);
		this.applicationForm.controls['tdhud'].setValue(false);
		this.applicationForm.controls['overlay'].setValue(false);
		this.applicationForm.controls['backer'].setValue(false);
		this.applicationForm.controls['ebpp'].setValue(false);
		this.applicationForm.controls['processingHold'].setValue(false);
		this.applicationForm.controls['printLocation'].setValue("");
		this.applicationForm.controls['mailingAddress1'].setValue("");
		this.applicationForm.controls['mailingAddress2'].setValue("");
		this.applicationForm.controls['mailngCity'].setValue("");
		this.applicationForm.controls['mailingState'].setValue("");
		this.applicationForm.controls['mailingZipCode'].setValue("");
		this.applicationForm.controls['physicalAddress1'].setValue("");
		this.applicationForm.controls['physicalAddress2'].setValue("");
		this.applicationForm.controls['physicalCity'].setValue("");
		this.applicationForm.controls['physicalState'].setValue("");
		this.applicationForm.controls['physicalZipCode'].setValue("");
		this.applicationForm.controls['contactName'].setValue("");
		this.applicationForm.controls['heldAddress1'].setValue("");
		this.applicationForm.controls['heldAddress2'].setValue("");
		this.applicationForm.controls['heldCity'].setValue("");
		this.applicationForm.controls['heldZipCode'].setValue("");
		this.applicationForm.controls['shipmentMethod'].setValue("");
		this.applicationForm.controls['heldAddressState'].setValue("");
		this.applicationForm.controls['heldContactNameOther'].setValue("");
		this.applicationForm.controls['heldAddressOther1'].setValue("");
		this.applicationForm.controls['heldAddressOther2'].setValue("");
		this.applicationForm.controls['heldCityOther'].setValue("");
		this.applicationForm.controls['heldZipCodeOther'].setValue("");
		this.applicationForm.controls['heldShipmentMethodOther'].setValue("");
		this.applicationForm.controls['heldAddressStateOther'].setValue("");
		this.applicationForm.controls['holdReason'].setValue("");
		if(this.custName==null){
			this.applicationForm.controls['customerCode'].setValue("");
			this.applicationForm.controls['customerName'].setValue("");
			
			this.setFocus();
			let array_disabledFields = ["customerName", "customerCode"]
			Object.keys(this.applicationForm.controls).forEach(key => {
			if(array_disabledFields.indexOf(key)>=0){
				
			}else{
                this.applicationForm.controls[key].setErrors(null);
			}
		});
		this.disableAllControls();	
		}
		else{
			this.setFocusToAppName();
			
		}
		this.applicationForm.markAsUntouched();
		this.applicationForm.markAsPristine();

		this.NotificationPanelOpenState = false;
		this.HeldPanelOpenState = false;
		this.pysicalPanelOpenState = false;
	}
	 
    async isChangeInProcessingHold(event){
		this.isChange('processingHold')
		if(event.target.checked){
			this.applicationForm.controls['holdReason'].enable();
		}else{
			if(this.applicationForm.get('holdReason').value){
                let checkBoxConfirmation = await this.popupService.openConfirmDialog("You are about to change Hold Processing. \n Are you sure you want to change anyway?", "help_outline");
				if (checkBoxConfirmation === "ok") { 
					this.applicationForm.controls['holdReason'].setValue("");
					this.applicationForm.controls['holdReason'].disable();
				}else{
					this.applicationForm.controls['processingHold'].setValue(1);
				}
			}else{
				this.applicationForm.controls['holdReason'].disable();
			}
		}
	}

	 loadApplicationList(applicationData) {
		//this.fromEditCustomer = this.custName ? true : false ;
		this.applicationForm.controls['customerName'].enable();
		this.applicationForm.controls['customerCode'].enable();
		this.applicationForm.controls['applicationName'].enable();
		this.applicationForm.controls['applicationCode'].enable();
		this.clientID = applicationData[0].clientID;
		this.selectedCustID = applicationData[0].clientID;
		this.custName = applicationData[0].customerName;
		this.custCode = applicationData[0].customerCode;
		this.appName = applicationData[0].applicationName;
		this.isAppNameView = true;
		this.appCode = applicationData[0].applicationCode;
		this.applicationIDToUpdate = applicationData[0].applicationID;
		this.applicationid=applicationData[0].applicationID;
		this.applicationForm.controls['customerCode'].setValue({customerCode: this.custCode});
		this.applicationForm.controls['customerName'].setValue({customerName: this.custName});
		this.applicationForm.controls['applicationName'].setValue(this.appName);
		this.applicationForm.controls['applicationCode'].setValue(this.appCode);
		for (let item of this.statesArray) {
			if (item.stateCode === applicationData[0].customerState) {
				this.applicationForm.controls['customerState'].setValue({stateCode : item.stateCode });
			}
		}	
		if(applicationData[0].stid != null && applicationData[0].stid != ''){
			let value_IMB = applicationData[0].stid.substring(0, 3); 
			//if IMB Tracing is Checked
			if (value_IMB == this.trackingSTID) {
				this.applicationForm.controls['imbTracing'].setValue(1)
			}
			//if imb tracing not checked
			else if (value_IMB == this.defaultSTID) {
				this.applicationForm.controls['imbTracing'].setValue(0)
			}
			if (applicationData[0].stid.length == 4) {
				let value_Endorsement = applicationData[0].stid.substring(3);
				this.applicationForm.controls['endorsement'].setValue(value_Endorsement);
			}else{
				this.applicationForm.controls['endorsement'].setValue("");
			}
	    }

		if (applicationData[0].customerFlag !== "" && applicationData[0].customerFlag !== null) {
			this.applicationForm.controls['customerFlag'].setValue(parseInt(applicationData[0].customerFlag));
		}

		if (applicationData[0].software !== "" && applicationData[0].software !== null) {
			this.applicationForm.controls['software'].setValue(parseInt(applicationData[0].software));
		}


		this.applicationForm.controls['customerID'].setValue(applicationData[0].customerID);
		this.applicationForm.controls['printSide'].setValue(applicationData[0].printSide);
		this.applicationForm.controls['appType'].setValue(applicationData[0].appType);
		this.applicationForm.controls['color'].setValue(applicationData[0].color);
		this.applicationForm.controls['runFrequency'].setValue(applicationData[0].runFrequency);
		this.applicationForm.controls['printLocation'].setValue(applicationData[0].printLocation);
		this.applicationForm.controls['paper'].setValue(applicationData[0].paper);   //res.state
		this.applicationForm.controls['perf'].setValue(applicationData[0].perf);
		this.applicationForm.controls['size'].setValue(applicationData[0].size);
		this.applicationForm.controls['outsideEnvelope'].setValue(applicationData[0].outsideEnvelope);
		this.applicationForm.controls['returnEnvelope'].setValue(applicationData[0].returnEnvelope);
		this.applicationForm.controls['unBundled'].setValue(applicationData[0].unBundled);
		this.applicationForm.controls['thirdParty'].setValue(applicationData[0].thirdParty);
		this.applicationForm.controls['ancillaryBill'].setValue(applicationData[0].ancillaryBill);
		this.applicationForm.controls['invoiceBill'].setValue(applicationData[0].invoiceBill);
		this.applicationForm.controls['active'].setValue(applicationData[0].active);
		this.applicationForm.controls['multimeterBill'].setValue(applicationData[0].multimeterBill);
		this.applicationForm.controls['pdf'].setValue(applicationData[0].pdf);
		this.applicationForm.controls['autoRun'].setValue(applicationData[0].autoRun);
		this.applicationForm.controls['duplex'].setValue(applicationData[0].duplex);
		this.applicationForm.controls['detailBill'].setValue(applicationData[0].detailBill);
		this.applicationForm.controls['municipalBill'].setValue(applicationData[0].municipalBill);
		this.applicationForm.controls['summaryBill'].setValue(applicationData[0].summaryBill);
		this.applicationForm.controls['check'].setValue(applicationData[0].check);
		this.applicationForm.controls['delinquent'].setValue(applicationData[0].delinquent);
		this.applicationForm.controls['itemizedBill'].setValue(applicationData[0].itemizedBill);
		this.applicationForm.controls['mdm'].setValue(applicationData[0].mdm);
		this.applicationForm.controls['tva'].setValue(applicationData[0].tva);
		this.applicationForm.controls['tdhud'].setValue(applicationData[0].tdhud);
		this.applicationForm.controls['overlay'].setValue(applicationData[0].overlay);
		this.applicationForm.controls['backer'].setValue(applicationData[0].backer);
		this.applicationForm.controls['ebpp'].setValue(applicationData[0].abpp);
		this.applicationForm.controls['processingHold'].setValue(applicationData[0].processingHold);
		if(applicationData[0].processingHold){
			this.applicationForm.controls['holdReason'].enable();
			this.applicationForm.controls['holdReason'].setValue(applicationData[0].holdReason);
		}else{
			this.applicationForm.controls['holdReason'].disable();
		}
		this.applicationForm.controls['mailingAddress1'].setValue(applicationData[0].mailingAddress1);
		this.applicationForm.controls['mailingAddress2'].setValue(applicationData[0].mailingAddress2);
		this.applicationForm.controls['mailngCity'].setValue(applicationData[0].mailngCity);
		this.applicationForm.controls['mailingState'].setValue(applicationData[0].mailingState);
		this.applicationForm.controls['mailingZipCode'].setValue(applicationData[0].mailingZipCode);
		this.applicationForm.controls['physicalAddress1'].setValue(applicationData[0].physicalAddress1);
		this.applicationForm.controls['physicalAddress2'].setValue(applicationData[0].physicalAddress2);
		this.applicationForm.controls['physicalCity'].setValue(applicationData[0].physicalCity);
		this.applicationForm.controls['physicalState'].setValue(applicationData[0].physicalState);   
		this.applicationForm.controls['physicalZipCode'].setValue(applicationData[0].physicalZipCode);
		this.applicationForm.controls['contactName'].setValue(applicationData[0].contactName);
		this.applicationForm.controls['heldAddress1'].setValue(applicationData[0].heldAddress1);
		this.applicationForm.controls['heldAddress2'].setValue(applicationData[0].heldAddress2);
		this.applicationForm.controls['heldCity'].setValue(applicationData[0].heldCity);
		this.applicationForm.controls['heldZipCode'].setValue(applicationData[0].heldZipCode);
		this.applicationForm.controls['shipmentMethod'].setValue(applicationData[0].shipmentMethod);
		this.applicationForm.controls['heldAddressState'].setValue(applicationData[0].heldAddressState);
		this.applicationForm.controls['heldContactNameOther'].setValue(applicationData[0].heldContactNameOther);
		this.applicationForm.controls['heldAddressOther1'].setValue(applicationData[0].heldAddressOther1);
		this.applicationForm.controls['heldAddressOther2'].setValue(applicationData[0].heldAddressOther2);
		this.applicationForm.controls['heldCityOther'].setValue(applicationData[0].heldCityOther);
		this.applicationForm.controls['heldZipCodeOther'].setValue(applicationData[0].heldZipCodeOther);
		this.applicationForm.controls['heldShipmentMethodOther'].setValue(applicationData[0].heldShipmentMethodOther);
		this.applicationForm.controls['heldAddressStateOther'].setValue(applicationData[0].heldAddressStateOther);
		this.applicationForm.controls['checkHeld1TypeId'].setValue(applicationData[0].checkHeld1TypeId);
		this.applicationForm.controls['held2TypeId'].setValue(applicationData[0].held2TypeId);
		this.showNotifications = true;
		this.applicationForm.controls['customerName'].disable();
		this.applicationForm.controls['customerCode'].disable();
		this.applicationForm.controls['applicationName'].disable();
		this.applicationForm.controls['applicationCode'].disable();
		if (this.hasScreenUpdatePriviledge) {
			//this.disableAllControls();
			this.isAllowSave=true;
			this.disableAddressControls();
		}
		else{
			this.disableAllControls();
			this.isAllowSave=false;
		}
		//To load all the notifications of the selected application.
		this.getNotifications();
		
	}


	//CheckActiveApplicationsExist
	async checkActiveApplications(){
		let isExist='';
		
		let promise = await new Promise((resolve, reject) => {
			this.applicationservice.checkActiveApplicationExist(this.clientID,this.applicationIDToUpdate).subscribe(
				result=>{
					 isExist=result.message;
					 resolve(isExist);
				},
				(error)=>{
					reject();
					console.log(error);
				}
			);
			
		});
		return isExist;
	}
	async getResponse() {
		const userresponse = await this.popupService.openConfirmDialog("All applications of this customer are inactive. Do you wish to make the Customer also inactive ? <br/><br/>"+
		"Clicking on OK will mark application and customer as inactive. <br/> Clicking on Cancel will mark the application as inactive.  " , "help_outline");
		if (userresponse === "ok") {
			return true;
		}
		else {
		  return false;
		}
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

	NotficationId: number;
	selectRow(row) {
		this.NotficationId = row.id;
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
	}


	//  On Customer Dropdown change
	isChangeInCustomer(event) {
		for (let name of this.customerNames) {
			if (name.customerCode === event.source.value) {
				this.selectedCustID = name.customerId;
				this.applicationForm.controls['customerCode'].setValue(name.customerCode.toString());
				this.applicationForm.controls['customerName'].setValue(name.customerCode.toString());
			}
			else if (event.source.value === -1) {
				this.applicationForm.controls['customerCode'].setValue(-1);
				this.applicationForm.controls['customerName'].setValue(-1);
			}
		}
	}

	

	

	//to initialize customer name and code to auto complete
	initializeAutocompleteCustomer() {
		this.filteredOptionsCustomer = this.applicationForm.controls['customerName'].valueChanges
			.pipe(
				startWith<string | Customer>(''),
				map(value => typeof value === 'string' ? value : value.customerName),
				map(customerName => customerName ? this._filterCustName(customerName) : this.customerNames.slice())
			);

		this.filteredOptionsCustomerCode = this.applicationForm.controls['customerCode'].valueChanges
			.pipe(
				startWith<string | Customer>(''),
				map(value => typeof value === 'string' ? value : value.customerCode),
				map(ccode => ccode ? this._filterCustCode(ccode) : this.customerNames.slice()),
				map(ccode => ccode.sort((a, b) => (a.customerCode > b.customerCode) ? 1 : ((b.customerCode > a.customerCode) ? -1 : 0)))
			);

	}

	//display value in auto complete customer name and customer code
	displayFn(user?: Customer): string | undefined {
		return user ? user.customerName : undefined;
	}

	displayFnCustCode(user?: Customer): string | undefined {
		return user ? user.customerCode : undefined;
	}

	private _filterCustName(name: string): Customer[] {
		const filterValue = name.toLowerCase();
		return this.customerNames.filter(option => option.customerName.toLowerCase().indexOf(filterValue) === 0);
	}
	// For Cust code.
	private _filterCustCode(name: string): Customer[] {
		const filterValue = name.toLowerCase();
		return this.customerNames.filter(option => option.customerCode.toLowerCase().indexOf(filterValue) === 0);
	}


	scrollToDown() {
		var elmnt = document.getElementById("matCardApplicationHeldAddressMoveSmooth");
		elmnt.scrollIntoView({ behavior: "smooth" });
	}


	// notifications code start
	//open the notifications popup and also row double click 
	async openNotificationPopUp(flagType: any) {
		//const userresponse2 = this.popupdlgService.OpenNotificationDialog("Notifications");  // open popup using popup service
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		if (flagType == "all") {
			dialogConfig.data = {
				Strtitle: "Notifications",
				customerName: this.custName,
				customerCode: this.custCode,
				clientID: this.clientID,
				appName: this.appName,
				appCode: this.appCode,
				openAsView: this.editMode,
				appID: this.applicationIDToUpdate
			}
		} else {
			dialogConfig.data = {
				Strtitle: "Notifications",
				customerName: this.custName,
				customerCode: this.custCode,
				clientID: this.clientID,
				appName: this.appName,
				appCode: this.appCode,
				appID: this.applicationIDToUpdate,
				openAsView: this.editMode,
				notification: flagType
			}
		}

		const NotificationsDialogRef = this.dialog.open(NotificationsDialogComponent, dialogConfig);
		NotificationsDialogRef.afterClosed().subscribe(result => {
			this.getNotifications();
		});
	}


	//get Notifications list
	tempObj = [];
	async getNotifications() {
	this.tempObj = [];
		this.allNotifications = await this.applicationservice.getAllNotifications(this.clientID, this.applicationIDToUpdate);
		this.allNotifications.subscribe(results => {
			if (!results) { return };
			if (results) {
				for (let i = 0; i < results.length; i++) {
					if (results[i]['alarmExist']) {
						this.tempObj.push(results[i]);
					}
				}
				this.notificationsDataSource.sort = this.notificationsSort;
				this.notificationsDataSource.data = this.tempObj;
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});

		//To sort based on table header.
		this.notificationsDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};	
	}
	//Navigates to view application after validating any changes made by customer.
	async moveToViewApplication() {
		if(this.fromEditCustomer && this.fromEditCustomerID && this.custName){
			this.moveToEditCustomer();
			localStorage.removeItem('navigatedFromCustomer');
		}
		else{
			
			if (this.isChangesExists) {
				let isFieldsSame=true;
				const applicationData =this.buildApplicationObject();
				let promise = await new Promise((resolve, reject) => {
					isFieldsSame=this.isFieldsSame(applicationData);
					resolve();
				});
					if (!isFieldsSame) {
						const userresponse = await this.popupService.openConfirmDialog(MessageConstants.BACKMESSAGE, "help_outline");
						if (userresponse === "ok") {
							this.isChangesExists = false;
							if(localStorage.getItem('navigatedFromCustomer')!=null){
								localStorage.removeItem('navigatedFromCustomer');
								this.router.navigate(['./add_customer', this.selectedCustID]);
							}else{
								this.router.navigate(['./view_application']);
							}							
						}
					}else {
						this.isChangesExists = false;
						if(localStorage.getItem('navigatedFromCustomer')!=null){
							localStorage.removeItem('navigatedFromCustomer');
							this.router.navigate(['./add_customer', this.selectedCustID]);
						}else{
							this.router.navigate(['./view_application']);
						}
					}
			} else {
				this.isChangesExists = false;
				if(localStorage.getItem('navigatedFromCustomer')!=null){
					localStorage.removeItem('navigatedFromCustomer');
					this.router.navigate(['./add_customer', this.selectedCustID]);
				}else{
					this.router.navigate(['./view_application']);
				}
			}
		}	
	}

	
	checkNotificationsExistOrNot(row: any) {
		let flag = false;
		if (row.NotifyPDF || row.NotifyFileReceived || row.NotifyJobComplete || row.EmailCode1 || row.EmailRMT) {
			flag = true;
		}
		return flag;
	}
	// notifications code end 

	
		//Validation for CustomerName AutoComplete.
	validateCustomerNameAutoCompletes(event) {
		this.invalidCustName = false;
		let  filterCustomer : any = (event.target.value != null && this.customerNames.length > 0) ? 
		 (this.customerNames.find(cst => cst.customerName.toLowerCase() === event.target.value.toLowerCase()) != undefined ? true : false)
		 : false;
		if (event.target.value =='') {
			this.disableAllControls();
			this.clearCustomerValuesAndErrors();
		}
		else if(event.target.value.length > 0){
			if(!filterCustomer){
				this.applicationForm.controls['customerCode'].setValue("");
				this.applicationForm.controls['customerCode'].clearValidators();
				this.applicationForm.controls['customerName'].setErrors({'isCustomerNameExist': true});
				this.invalidCustName = true;
				this.disableAllControls();
			}
			else{
				this.invalidCustName = false;
				this.customerOnChange(event.target.value);
				this.applicationForm.controls['customerName'].setErrors(null);
			}

		}
	}
	//clear CustomerValues And Errors.
	clearCustomerValuesAndErrors(){
		//clear values.
		this.applicationForm.controls['customerName'].setValue("");
		this.applicationForm.controls['customerCode'].setValue("");
		
		//clear validators.
		this.applicationForm.controls['customerName'].clearValidators();
		this.applicationForm.controls['customerCode'].clearValidators();
	}
	//On Customer  Dropdown change functionality.
	customerOnChange(customerObject){
		for (let name of this.customerNames) {
			if (name.customerName.toLowerCase() === customerObject.toLowerCase() ||name.customerCode.toLowerCase() === customerObject.toLowerCase() ) {
				this.selectedCustID = name['customerId'];
				this.applicationForm.controls['customerCode'].setValue({ customerCode: name.customerCode });
				this.applicationForm.controls['customerName'].setValue({ customerName: name.customerName });
				this.enableAllControls();
			}
		}

	}
	//  On Customer  Dropdown change
	isChangeInCustomerOption(customerObject: any) {
		this.invalidCustName = false;
		this.invalidCustCode = false;
			this.applicationForm.controls['customerCode'].setValue('');
			this.applicationForm.controls['customerName'].setValue(''); 
			this.customerOnChange(customerObject.option.value.customerName);
	}
	//Validation for CustomerCode.
	validateCustomerCodeAutoCompletes(event){
		this.invalidCustCode = false;
		let  filterCustomerCode : any = (event.target.value != null && this.customerNames.length > 0) ? 
		(this.customerNames.find(cst => cst.customerCode.toLowerCase() === event.target.value.toLowerCase()) != undefined ? true : false)
		: false;
	   if (event.target.value =='') {
			this.disableAllControls();
		   this.clearCustomerValuesAndErrors();
	   }
	   else if(event.target.value.length > 0){
		   if(!filterCustomerCode){
			   this.applicationForm.controls['customerName'].setValue("");
			   this.applicationForm.controls['customerCode'].setErrors({'isCustomerCodeExist': true});
			   this.applicationForm.controls['customerName'].clearValidators();
			   this.invalidCustCode = true;
			   this.disableAllControls();
		   }
		   else{
			   this.invalidCustCode = false;
			   this.customerOnChange(event.target.value);
			   this.applicationForm.controls['customerName'].setErrors(null);
		   }

	   }
	}

	async moveToEditCustomer(){
		if(this.isChangesExists && this.custName){
			const applicationData=this.buildApplicationObject();
			//this.applicationPristineData.clientID=applicationData.clientID;
			this.applicationPristineData.clientID = this.fromEditCustomerID		
			if(JSON.stringify(applicationData)!=JSON.stringify(this.applicationPristineData)){
				const response = await this.popupService.openConfirmDialog(MessageConstants.BACKMESSAGE, "help_outline");
				if (response === "ok") {
					this.isChangesExists = false;
					await this.router.navigate(['./add_customer', this.selectedCustID]);
				}
			}
			else{
				this.isChangesExists = false;
				await this.router.navigate(['./add_customer',  this.selectedCustID]);
			}
		}
		else{
			await this.router.navigate(['./add_customer',  this.selectedCustID]);
		}
	}

	

	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {

	  return this.preventRedirection();
	}
}

/** Error when invalid control is dirty, touched, or submitted. */
class CrossFieldErrorMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return control.dirty && form.invalid;
	}
}

export class contactNotifications {
	id: number;
	contactName: string;
	pdfisready: string;
	filereceived: string;
	jobcompleted: string;
	emailrmt: string;
	emailcode1report: string;
	email: string;
}
