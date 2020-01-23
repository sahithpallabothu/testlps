// Angular components.
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Inject, Injectable } from '@angular/core';
import { FormControl, FormBuilder, AbstractControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

// Business classes.
import { Customer, HeldType } from '@/businessclasses/Customer/customer';
import { States } from '../../../businessclasses/admin/states';
import { Shipmentmethod } from '../../../businessclasses/admin/shipmentmethod';
import { contact } from '../../../businessclasses/customer/contact';

// Business services.
import { CustomerService } from '../../../businessservices/customer/customer.service';
import { StatesService } from '../../../businessservices/admin/states.service';
import { ShipmentmethodService } from '../../../businessservices/admin/shipmentmethod.service';
import { ContactService } from '../../../businessservices/customer/contact.service';
import { UserPrivilegesService } from '@/_services';
import { ApplicationService } from '../../../businessservices/application/application.service';

// Business components.
import { ContactDialogComponent } from '@/businesscomponents/Customer/contact-dialog/contact-dialog.component';
import { ServiceAgreementDialogComponent } from '@/businesscomponents/Customer/service-agreement-dialog/service-agreement-dialog.component';
import { AddApplicationNewComponent } from '@/businesscomponents/Application/add-application-new/add-application-new.component';

// Popup messages. 
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { PopupDialogService } from '../../../shared/popup-dialog.service';
import { ErrorMatcher } from '@/shared/errorMatcher';

//Constants.
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { Constants } from '@/app.constants';
import { TrimMask } from '@/shared/trimMask';

import { HostListener } from '@angular/core';

@Component({
	selector: 'app-addcustomer',
	templateUrl: './addcustomer.component.html',
	styleUrls: ['./addcustomer.component.css']
})
export class AddcustomerComponent implements OnInit {

	// buttons show in edit customer view
	showButtons = false;
	showPanals = false;
	showBackButton = false;
	//customer screen open a dialog.
	customerFromHome: boolean = false;
	editCustomerDialog: boolean;
	addCustomerScreen: boolean = true;
	customerid: number;
	title: string;
	isDisabledSaveBtnInDialog: boolean = false;
	//for telephone mask.
	telephonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	errorMatcher = new ErrorMatcher();//errorMatcher.
	customerForm: FormGroup;
	pysicalPanelOpenState = false;// panel header content.
	heldPanelOpenState = false;// panel header content.
	isChangesExists: boolean = false;
	isCustomerChangesExists: boolean = false;

	//For states autocomplete.
	statesArray: States[] = [];
	mailingStateCodes: States[] = [];
	physicalStateCodes: States[] = [];
	heldStateCodes: States[] = [];
	heldAddressTypes: HeldType[] = [];
	filteredOptionsMailingStates: Observable<States[]>;
	filteredOptionsPhysicalStates: Observable<States[]>;
	filteredOptionsHeldStates: Observable<States[]>;
	filteredOptionsCheckHeldStates: Observable<States[]>;
	@ViewChild('mState') mState: ElementRef;
	@ViewChild('pState') pState: ElementRef;
	@ViewChild('hState') hState: ElementRef;
	@ViewChild('checkHeldState') checkHeldState: ElementRef;

	//For customer.
	customerArray: Customer[] = [];
	customerToUpdateArray = [];
	@ViewChild('custName') custName: ElementRef;
	@ViewChild('custCode') custCode: ElementRef;

	//For shipment method autocomplete.
	shipmentMethodArray: Shipmentmethod[] = [];
	filteredOptionsShipmentMethod: Observable<Shipmentmethod[]>;
	filteredOptionsCheckShipmentMethod: Observable<Shipmentmethod[]>;
	@ViewChild('heldShipMent') heldShipMent: ElementRef;
	@ViewChild('checkHeldShipMent') checkHeldShipMent: ElementRef;

	//For held contacts autocomplete.
	contactsArray: contact[] = [];
	contactsList: contact[] = [];
	filteredOptionsHeldCheckContacts: Observable<contact[]>;
	filteredOptionsHeldOtherContacts: Observable<contact[]>;
	@ViewChild('checkHeldContact') checkHeldContact: ElementRef;
	@ViewChild('heldOtherContact') heldOtherContact: ElementRef;
	@ViewChild('f') myForm;//to reset the form.
	customerIDToUpdate: number = null;
	recentAddedCustID: any;
	selectedCustName: string;
	selectedCustCode: string;
	id: number;
	isempty = false;
	isFound = false;
	//space message.
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

	//Screen privilege variables
	hasScreenReadPriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	hasApplicationScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;
	idFromHome: number;
	disableSaveForDropdown: boolean = false;
	isEditCustomer :boolean = false;
	// variable declarations ends here.

	constructor(private formbulider: FormBuilder,
		private stateService: StatesService,
		private shipmentMethodService: ShipmentmethodService,
		private applicationservice: ApplicationService,
		private customerservice: CustomerService,
		private contactService: ContactService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private route: ActivatedRoute,
		private dialog: MatDialog,
		private router: Router,
		private element: ElementRef,
		private dialogRef: MatDialogRef<AddcustomerComponent>,
		private userPrivilegesService: UserPrivilegesService,
		@Inject(MAT_DIALOG_DATA) data
	) {
		// when add customer open as dialog 
		this.title = data.title;
		this.editCustomerDialog = data.customerFromHome;
		if (this.editCustomerDialog) {
			this.isDisabledSaveBtnInDialog = true;
			this.addCustomerScreen = false;//for cansel button visible in different actions.			
			this.idFromHome = data.customerID;
		}
		//Set Customer screen privileges
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.customerScreenName)) {
			this.hasScreenUpdatePriviledge = true;
		}
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.editCustomerScreenName)) {
			this.hasScreenUpdatePriviledge = true;
			 this.isEditCustomer = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.customerScreenName)) {
			this.hasScreenInsertPriviledge = true;
		}
		if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.customerScreenName)) {
			this.hasScreenReadPriviledge = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.applicationScreenName)) {
			this.hasApplicationScreenInsertPriviledge = true;
		}
		this.loadAllSipmentMethods();
		this.loadAllStates();
		this.loadheldAddressTypes();
	}

	//To close customer dialog.
	async dialogCancel() {
		//this.dialogRef.close("cancel");
		//this.dialogRef.close(this.customerIDToUpdate);
 		if (this.customerIDToUpdate && this.dirtyFlagValidation(this.customerToUpdateArray, this.buildCustomerObject()) && this.isChangesExists) {
			const response = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
			if (response === "ok" && this.customerIDToUpdate) {
				this.dialogRef.close(this.customerIDToUpdate);				
			}		
		} else {			
			this.dialogRef.close(this.customerIDToUpdate);
		}
	}


	ngOnInit() {
		this.customerForm = this.formbulider.group({
			//Required fields.
			active: ['true', []],
			sedc: ['', []],
			ivr: ['', []],
			customerName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			customerCode: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			telephone: ['', [Validators.required, this.validateTelephone]],
			fax: ['', [this.validateTelephone]],
			ivrPhoneNumber: ['', [this.validateTelephone]],
			mailerId: ['', []],
			crid: ['', []],
			comment: ['', [SpaceValidator.ValidateSpaces]],
			//Mailing Address.
			mailingAddress1: ['', [SpaceValidator.ValidateSpaces]],
			mailingAddress2: ['', [SpaceValidator.ValidateSpaces]],
			mailingCity: ['', [Validators.pattern(/^[a-zA-Z ]+$/), SpaceValidator.ValidateSpaces]],
			mailingState: ['', []],
			mailingZip: ['', [Validators.pattern(/^\d{5}([-]|\s*)?(\d{4})?$/), SpaceValidator.ValidateSpaces]],
			//Physical Address.
			physicalAddress1: ['', [SpaceValidator.ValidateSpaces]],
			physicalAddress2: ['', [SpaceValidator.ValidateSpaces]],
			physicalCity: ['', [Validators.pattern(/^[a-zA-Z ]+$/), SpaceValidator.ValidateSpaces]],
			physicalState: ['', []],
			physicalZip: ['', [Validators.pattern(/^\d{5}([-]|\s*)?(\d{4})?$/), SpaceValidator.ValidateSpaces]],
			//Check Held Address.
			checkHeld1TypeId: ['', []],
			checkHeldAddress1: ['', [SpaceValidator.ValidateSpaces]],
			checkHeldAddress2: ['', [SpaceValidator.ValidateSpaces]],
			checkHeldCity: ['', [Validators.pattern(/^[a-zA-Z ]+$/), SpaceValidator.ValidateSpaces]],
			checkHeldState: ['', []],
			checkHeldZip: ['', [Validators.pattern(/^\d{5}([-]|\s*)?(\d{4})?$/), SpaceValidator.ValidateSpaces]],
			checkHeldContact: ['', []],
			checkHeldShipmentMethod: ['', []],
			//Other Held Address.
			held2TypeId: ['', []],
			heldAddress1: ['', [SpaceValidator.ValidateSpaces]],
			heldAddress2: ['', [SpaceValidator.ValidateSpaces]],
			heldCity: ['', [Validators.pattern(/^[a-zA-Z ]+$/), SpaceValidator.ValidateSpaces]],
			heldState: ['', []],
			heldZip: ['', [Validators.pattern(/^\d{5}([-]|\s*)?(\d{4})?$/), SpaceValidator.ValidateSpaces]],
			heldContact: ['', []],
			heldShipmentMethod: ['', []],
			applicationName: ['', []],
			applicationCode: ['', []],
		});
		this.setFocus();
		if(this.isEditCustomer && this.hasScreenUpdatePriviledge){
			this.customerForm.controls['customerName'].enable();
			this.customerForm.controls['customerCode'].enable();
		}
		this.setSaveBtnEnable();

		this.loadAllSipmentMethods();
		this.loadAllStates();
		this.loadheldAddressTypes();
		
		this.isDisabledSaveBtnInDialog ? this.disableControlsInDialog() : this.LoadDropdowns();//To load all dropdowns.
	}

	//To set Save button enable based on privilage.
	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge) {
			this.isAllowSave = true;
		} else {
			this.isAllowSave = false;
		}
	}

	//To disable Controls In Customer Dialog.
	disableControlsInDialog() {
		if (this.isDisabledSaveBtnInDialog) {
			this.LoadDropdowns();//To load all dropdowns.
			this.getCustomerById(this.idFromHome);
		}
	}

	// Used to set the focus for the first field.
	setFocus() {
		setTimeout(() => {
			this.custName.nativeElement.setSelectionRange(this.custName.nativeElement.value.length, this.custName.nativeElement.value.length);
			this.custName.nativeElement.focus();
		}, 0);
	}

	EnableOrDisableFormControls(isEnable : Boolean = true)
	{	
		for (var control in this.customerForm.controls)
		{			
			if(control != "customerName" && control != "customerCode" )
			{	
				isEnable ?  this.customerForm.controls[control].enable() : this.customerForm.controls[control].disable();
			}	
							 
		}
	}

	//validate spaces 
	validateSpaces(key) {
		key.srcElement.value = key.srcElement.value.trim();
	}

	//To check form field change or not.
	isChange() {
		this.isChangesExists = true;
	}

	//to initialize state codes to auto complete
	InitializeStatesAutoComplete() {
		this.filteredOptionsMailingStates = this.customerForm.controls['mailingState'].valueChanges
			.pipe(
				startWith<string | States>(''),
				map(value => typeof value === 'string' ? value : value.stateCode),
				map(mailingState => mailingState ? this._filterStates(mailingState) : this.statesArray.slice())
			);

		this.filteredOptionsPhysicalStates = this.customerForm.controls['physicalState'].valueChanges
			.pipe(
				startWith<string | States>(''),
				map(value => typeof value === 'string' ? value : value.stateCode),
				map(physicalState => physicalState ? this._filterStates(physicalState) : this.statesArray.slice())
			);

		this.filteredOptionsHeldStates = this.customerForm.controls['heldState'].valueChanges
			.pipe(
				startWith<string | States>(''),
				map(value => typeof value === 'string' ? value : value.stateCode),
				map(heldState => heldState ? this._filterStates(heldState) : this.statesArray.slice())
			);

		this.filteredOptionsCheckHeldStates = this.customerForm.controls['checkHeldState'].valueChanges
			.pipe(
				startWith<string | States>(''),
				map(value => typeof value === 'string' ? value : value.stateCode),
				map(checkHeldState => checkHeldState ? this._filterStates(checkHeldState) : this.statesArray.slice())
			);
	}

	//To filter states.
	private _filterStates(value: string): States[] {
		const filterValue1 = value.toLowerCase();
		return this.statesArray.filter(option => option.stateCode.toLowerCase().indexOf(filterValue1) === 0);
	}

	//To display selected state in input field.
	displayStates(state?: States): string | undefined {
		return state ? state.stateCode : undefined;
	}

	//to initialize state codes to auto complete
	initializeAutocompleteShipmentMethod() {
		this.filteredOptionsShipmentMethod = this.customerForm.controls['heldShipmentMethod'].valueChanges
			.pipe(
				startWith<string | Shipmentmethod>(''),
				map(value => typeof value === 'string' ? value : value.shipmentMethod),
				map(shipmentMethod => shipmentMethod ? this._filterShipmentMethod(shipmentMethod) : this.shipmentMethodArray.slice())
			);
		this.filteredOptionsCheckShipmentMethod = this.customerForm.controls['checkHeldShipmentMethod'].valueChanges
			.pipe(
				startWith<string | Shipmentmethod>(''),
				map(value => typeof value === 'string' ? value : value.shipmentMethod),
				map(checkHeldShipmentMethod => checkHeldShipmentMethod ? this._filterShipmentMethod(checkHeldShipmentMethod) : this.shipmentMethodArray.slice())
			);
	}

	//To filter ShipmentMethod.
	private _filterShipmentMethod(value: string): Shipmentmethod[] {
		const filterValue = value.toLowerCase();
		return this.shipmentMethodArray.filter(option => option.shipmentMethod.toLowerCase().indexOf(filterValue) === 0);
	}

	//To display selected Shipmentmethod in input field.
	displayFnShipmentMethod(sm?: Shipmentmethod): string | undefined {
		return sm ? sm.shipmentMethod : undefined;
	}

	//Validation for States fields.
	validateMailingStateAutoCompletes() {
		let ms = this.mState.nativeElement.value;
		// this.validateStateAutoCompletes(ms, "MS");
		this.ValdateAutoCompletes(ms, "STATE" ,"mailingState");
	}
	validatePhysicalStateAutoCompletes() {
		let ps = this.pState.nativeElement.value;
		this.ValdateAutoCompletes(ps, "STATE" ,"physicalState");
		// this.validateStateAutoCompletes(ps, "PS");
	}
	validateHeldStateAutoCompletes() {
		let hs = this.hState.nativeElement.value;
		// this.validateStateAutoCompletes(hs, "HS");
		this.ValdateAutoCompletes(hs, "STATE" ,"heldState");
	}
	validateCheckHeldStateAutoCompletes() {
		let chs = this.checkHeldState.nativeElement.value;
		// this.validateStateAutoCompletes(chs, "CHS");
		this.ValdateAutoCompletes(chs, "STATE" ,"checkHeldState");
	}

	//to validate state code.
	filterValidState(value): boolean {
		let filterStates: boolean;
		if (value.trim().length > 0) {
			filterStates = (this.statesArray != null && this.statesArray.length > 0) ?
				(this.statesArray.find(st => st.stateCode.toLowerCase() === value.toLowerCase()) != undefined ? true : false)
				: false;
			return filterStates;
		}
		else {
			return filterStates = true;
		}
	}


	ValdateAutoCompletes(value: any, controlType:string, controlName: string)
	{
		let res:boolean;
		this.isChangesExists = true;
		switch (controlType)
		{
			case 'STATE':
					res = this.filterValidState(value);
				break;
			case 'SHIPMENT':
					res = this.filterValidShipmentMethod(value);
				break;
			case 'CONTACT':
					res = this.filterValidContact(value);
				break;
		}

		if (!res) 
		{
			let iscontact = false;
		    if(controlType == "CONTACT")
		    {
				if (this.contactsArray == null || this.contactsArray.length == 0) {
					this.customerForm.controls[controlName].setErrors({ 'noContacts': true });
					iscontact = true;
				}
		   	}
			if(!iscontact){
				this.customerForm.controls[controlName].setErrors({ 'incorrect': true });
			}
		}
		else
		{		   
			this.customerForm.controls[controlName].clearValidators();			
		}
	}

	//Validation for Shipment method fields.
	validateCheckShipmentMethodAutoCompletes() {
		let chsm = this.checkHeldShipMent.nativeElement.value;
		this.ValdateAutoCompletes(chsm, "SHIPMENT","checkHeldShipmentMethod");
	}
	validateHeldShipmentMethodAutoCompletes() {
		let hsm = this.heldShipMent.nativeElement.value;
		this.ValdateAutoCompletes(hsm, "SHIPMENT","heldShipmentMethod");
	}


	//to validate state code.
	filterValidShipmentMethod(value): boolean {
		let filterShipmentMethod
		if (value.trim().length > 0) {
			filterShipmentMethod = (this.shipmentMethodArray != null && this.shipmentMethodArray.length > 0) ?
				(this.shipmentMethodArray.find(sm => sm.shipmentMethod.toLowerCase() === value.toLowerCase()) != undefined ? true : false)
				: false;
			return filterShipmentMethod;
		}
		else {
			return filterShipmentMethod = true;
		}
	}

	//To initialize Held Contacts to auto complete
	InitializeHeldContactsAutoComplete() {
		this.filteredOptionsHeldCheckContacts = this.customerForm.controls['checkHeldContact'].valueChanges
			.pipe(
				startWith<string | contact>(''),
				map(value => typeof value === 'string' ? value : value.contactFirstName || value.contactLastName),
				map(checkHeldContact => checkHeldContact ? this._filterHeldContacts(checkHeldContact) : this.contactsArray.slice())
			);

		this.filteredOptionsHeldOtherContacts = this.customerForm.controls['heldContact'].valueChanges
			.pipe(
				startWith<string | contact>(''),
				map(value => typeof value === 'string' ? value : value.contactFirstName || value.contactLastName),
				map(heldContact => heldContact ? this._filterHeldContacts(heldContact) : this.contactsArray.slice())
			);
	}

	//To filter Held Contacts.
	private _filterHeldContacts(value: string): contact[] {
		const filterValue = value.toLowerCase();
		return this.contactsArray.filter(option => (option.contactFirstName.toLowerCase().indexOf(filterValue) === 0 || option.contactLastName.toLowerCase().indexOf(filterValue) === 0));
	}

	//To display selected HeldContact in input field.
	displayFnHeldContacts(hc?: contact): string | undefined {
		return hc ? hc.contactFirstName + " " + hc.contactLastName : undefined;
	}

	// Validate held contacts.
	validateHeldCheckContactsAutoComplete() {
		let hcc = this.checkHeldContact.nativeElement.value;
		this.ValdateAutoCompletes(hcc, 'CONTACT', "checkHeldContact");
	}
	validateHeldOtherContactsAutoComplete() {
		let hoc = this.heldOtherContact.nativeElement.value;
		this.ValdateAutoCompletes(hoc, 'CONTACT', "heldContact");
	}

	//to validate state code.
	filterValidContact(value): boolean {
		let filterValidContact: boolean;
		if (this.contactsArray != null && this.contactsArray.length > 0) {
			if (value.trim().length > 0) {
				for (let hc of this.contactsArray) {
					let fullName = hc.contactFirstName + " " + hc.contactLastName;
					if (value.toLowerCase() && fullName.toLowerCase() == value.toLowerCase()) {
						filterValidContact = true;
						break;
					}
				}
			} else {
				filterValidContact = true;
			}
		} else {
			if (value.trim().length > 0) {
				filterValidContact = false;
			}
			else {
				filterValidContact = true;
			}
		}
		return filterValidContact;
	}

	//load All States.	
	async loadAllStates() {
		this.loadAllSipmentMethods();
		var promise = await new Promise((resolve, reject) => {
			this.stateService.getAllStates().subscribe(results => {
				this.statesArray = results;
				this.statesArray.sort((a, b) => (a.stateCode > b.stateCode) ? 1 : ((b.stateCode > a.stateCode) ? -1 : 0));
				if (this.statesArray.length > 0) { this.InitializeStatesAutoComplete(); }
				resolve();
			},
			(error) => {
				this.errorService.handleError(error);
				reject();
			});
		});
	}

	//load all heldAddressTypes
	async loadheldAddressTypes() {
		var promise = await new Promise((resolve, reject) => {
			this.customerservice.getHeldTypes().subscribe(results => {
				this.heldAddressTypes = results;
				resolve();
			},
				(error) => {
					this.errorService.handleError(error);
					reject();
				});
		});
	}

	// to load all customers
	async loadAllCustomers() {
		var promise = await new Promise((resolve, reject) => {
			this.customerservice.getAllCustomers(true).subscribe(results => {
				this.recentAddedCustID = results[0].customerId;
				this.customerArray = results;
				this.customerArray.sort((a, b) => (a.customerName > b.customerName) ? 1 : ((b.customerName > a.customerName) ? -1 : 0));
				resolve();
			},
				(error) => {
					this.errorService.handleError(error);
					reject();
				});
		});
	}

	// To load SipmentMethod data.
	async loadAllSipmentMethods() {
		this.loadAllContacts();
		var promise = await new Promise((resolve, reject) => {
			this.shipmentMethodService.getAllShipmentMethods().subscribe(results => {
				this.shipmentMethodArray = results;
				this.shipmentMethodArray.sort((a, b) => (a.shipmentMethod > b.shipmentMethod) ? 1 : ((b.shipmentMethod > a.shipmentMethod) ? -1 : 0));
				if (this.shipmentMethodArray.length > 0) { this.initializeAutocompleteShipmentMethod(); }
				resolve();
			},
			(error) => {
				this.errorService.handleError(error);
				reject();
			});
		});
	}

	//contacts//
	// To get all the available contacts from the database.
	async loadAllContacts() {
		const customerid = this.route.snapshot.paramMap.get('id');  // Getting current component's id or information using ActivatedRoute service
		let clientID = this.editCustomerDialog ? this.idFromHome : +customerid;
		if (clientID) {
			var promise = await new Promise((resolve, reject) => {
				this.contactService.getContacts(clientID).subscribe(results => {
					if (!results) { return };
					this.contactsArray = results;
					this.contactsList = results;
					if (this.contactsArray.length > 0) { this.InitializeHeldContactsAutoComplete(); }
					if (customerid !== null) { this.getCustomerById(customerid); }
					resolve();
				},
				(error) => {
					this.errorService.handleError(error);
					reject();
				});
			});
		}
	}


	//To build customer final object.
	buildCustomerObject(): any {
		const customerData = this.customerForm.value;
		customerData.customerId = this.customerIDToUpdate ? this.customerIDToUpdate : 0;
		customerData.customerName = this.custName.nativeElement.value.trim();
		customerData.customerCode = this.custCode.nativeElement.value.trim();
		customerData.applicationName = this.custName.nativeElement.value.trim(); //customerData.applicationName ? customerData.applicationName.trim():customerData.applicationName;
		customerData.applicationCode =  this.custCode.nativeElement.value.trim(); //customerData.applicationCode ? customerData.applicationCode.trim(): customerData.applicationCode;
		customerData.telephone = customerData.telephone ? TrimMask.trimMask(customerData.telephone) : customerData.telephone;
		customerData.fax = customerData.fax ? TrimMask.trimMask(customerData.fax) : customerData.fax;
		customerData.ivrPhoneNumber = customerData.ivrPhoneNumber ? TrimMask.trimMask(customerData.ivrPhoneNumber) : customerData.ivrPhoneNumber;
		customerData.crid = +customerData.crid;
		customerData.mailerId = +customerData.mailerId;

		customerData.comment = customerData.comment != null ? customerData.comment.trim() : customerData.comment;
		customerData.active = (customerData.active === null || customerData.active === "") ? false : customerData.active;
		customerData.sedc = (customerData.sedc === null || customerData.sedc === "") ? false : customerData.sedc;
		customerData.ivr = (customerData.ivr === null || customerData.ivr === "") ? false : customerData.ivr;

		customerData.mailingState = (customerData.mailingState === null || customerData.mailingState === "") ? "" : this.getValueForStateAutoCompletes("mailingState");
		customerData.physicalState = (customerData.physicalState === null || customerData.physicalState === "") ? "" : this.getValueForStateAutoCompletes("physicalState");
		customerData.heldState = (customerData.heldState === null || customerData.heldState === "") ? "" : this.getValueForStateAutoCompletes("heldState");

		customerData.heldShipmentMethod = (customerData.heldShipmentMethod === null || (customerData.heldShipmentMethod === undefined) || customerData.heldShipmentMethod === "") ? 0 : this.getValueForShipmentMethodAutoCompletes("heldShipmentMethod");
		customerData.heldContact = this.getValueForContactAutoCompletes("heldContact") === undefined ? 0 : this.getValueForContactAutoCompletes("heldContact");

		customerData.checkHeldState = (customerData.checkHeldState === null || customerData.checkHeldState === "") ? "" : this.getValueForStateAutoCompletes("checkHeldState");
		customerData.checkHeldShipmentMethod = (customerData.checkHeldShipmentMethod === null || customerData.checkHeldShipmentMethod === "") ? 0 : this.getValueForShipmentMethodAutoCompletes("checkHeldShipmentMethod");
		customerData.checkHeldContact = this.getValueForContactAutoCompletes("checkHeldContact") == undefined ? 0 : this.getValueForContactAutoCompletes("checkHeldContact");

		customerData.mailingAddress1 = customerData.mailingAddress1 ? customerData.mailingAddress1.toUpperCase() : customerData.mailingAddress1;
		customerData.mailingAddress2 = customerData.mailingAddress2 ? customerData.mailingAddress2.toUpperCase() : customerData.mailingAddress2;
		customerData.mailingState = customerData.mailingState ? customerData.mailingState.toUpperCase() : customerData.mailingState;
		customerData.mailingCity = customerData.mailingCity ? customerData.mailingCity.toUpperCase() : customerData.mailingCity;

		customerData.physicalAddress1 = customerData.physicalAddress1 ? customerData.physicalAddress1.toUpperCase() : customerData.physicalAddress1;
		customerData.physicalAddress2 = customerData.physicalAddress2 ? customerData.physicalAddress2.toUpperCase() : customerData.physicalAddress2;
		customerData.physicalState = customerData.physicalState ? customerData.physicalState.toUpperCase() : customerData.physicalState;
		customerData.physicalCity = customerData.physicalCity ? customerData.physicalCity.toUpperCase() : customerData.physicalCity;

		customerData.heldAddress1 = customerData.heldAddress1 ? customerData.heldAddress1.toUpperCase() : customerData.heldAddress1;
		customerData.heldAddress2 = customerData.heldAddress2 ? customerData.heldAddress2.toUpperCase() : customerData.heldAddress2;
		customerData.heldCity = customerData.heldCity ? customerData.heldCity.toUpperCase() : customerData.heldCity;
		customerData.heldState = customerData.heldState ? customerData.heldState.toUpperCase() : customerData.heldState;

		customerData.checkHeldAddress1 = customerData.checkHeldAddress1 ? customerData.checkHeldAddress1.toUpperCase() : customerData.checkHeldAddress1;
		customerData.checkHeldAddress2 = customerData.checkHeldAddress2 ? customerData.checkHeldAddress2.toUpperCase() : customerData.checkHeldAddress2;
		customerData.checkHeldCity = customerData.checkHeldCity ? customerData.checkHeldCity.toUpperCase() : customerData.checkHeldCity;
		customerData.checkHeldState = customerData.checkHeldState ? customerData.checkHeldState.toUpperCase() : customerData.checkHeldState;

		customerData.checkHeld1TypeId = customerData.checkHeld1TypeId == "" ? 0 : customerData.checkHeld1TypeId;
		customerData.held2TypeId = customerData.held2TypeId == "" ? 0 : customerData.held2TypeId;
		return customerData;

	}

	//To submit form data.
	onFormSubmit() {
		let customerData = this.buildCustomerObject();
		customerData.isAllowSave = false;
		if (this.custName.nativeElement.value != "" && this.custCode.nativeElement.value != ""
			&& this.custName.nativeElement.value != undefined && this.custCode.nativeElement.value != undefined
			&& this.custName.nativeElement.value != null && this.custCode.nativeElement.value != null
			&& this.customerForm.controls['telephone'].value != null && this.customerForm.controls['telephone'].value != ""
			&& this.customerForm.controls['telephone'].value != undefined) {			
			if (this.isChangesExists) {
				if (this.dirtyFlagValidation(this.customerToUpdateArray, customerData)) {				
					if (this.customerIDToUpdate == null && this.isChangesExists) {
						this.createCustomer(customerData);
					}
					else if (this.customerIDToUpdate && this.isChangesExists) {
						if (this.addressValidationFrom(customerData)) {
							this.updateCustomer(customerData);
						}
					}								
				}
				else {
					this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Edit Customer", "check_circle", false)
				}
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Edit Customer", "check_circle", false)
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.ADD_CUSTOMER, "Add Customer", "check_circle", false)
		}
	}

	//To get Value For State AutoCompletes.
	getValueForStateAutoCompletes(controlName): string {
		let val = this.customerForm.controls[controlName].value;
		if (typeof (val) == "object") {
			return val.stateCode.trim();
		}
		else {
			return val.trim();
		}
	}

	//To get Value For Shipment Method AutoCompletes.
	getValueForShipmentMethodAutoCompletes(controlName): string {
		let val = this.customerForm.controls[controlName].value;
		var shipMentID;
		if (typeof (val) == "object") {
			return val.shipmentMethodID;
		}
		else {
			for (var item of this.shipmentMethodArray) {
				if (item.shipmentMethod.toLowerCase() === val.toLowerCase()) {
					shipMentID = item.shipmentMethodID;
					break
				}
			}
			return shipMentID;
		}
	}

	//To get Value For Contact AutoCompletes.
	getValueForContactAutoCompletes(controlName): string {
		let val = this.customerForm.controls[controlName].value;
		let contactID
		if (typeof (val) == "object") {
			return val.contactID;
		}
		else {
			if(val){
				for (var item of this.contactsArray) {
					let contactName = item.contactFirstName.toLowerCase() + " " + item.contactLastName.toLowerCase();
					if (val && this.contactsArray && contactName.toLowerCase() === val.toLowerCase()) {
						contactID = item.contactID;
						break
					}
				}
				return contactID;
			}			
		}
	}

	//To validate Telephone.
	validateTelephone(control: FormControl): any {
		let isValidTelephoneNumber = true;
		if (control.value && control.value.indexOf("_") >= 0) {
			isValidTelephoneNumber = false;
			return isValidTelephoneNumber ? null : { 'InvalidTelephone': true };
		}
		return null;
	}

	//Validation for dirty Flag.
	dirtyFlagValidation(customer, item) {
		let keyFlag = true;
		let customerKeys = Object.keys(item);
			for (let key of customerKeys) {			
				if (key === "active" || key === "ivr" || key === "sedc") {
					item[key] = item[key] ? item[key] : false;
					customer[key] = customer[key] ? customer[key] : false;
					if (customer[key] === item[key]) {
						keyFlag = false
					}
					else {
						keyFlag = true;
						break;
					}
				}
				else if (key === "checkHeldContact" || key === "checkHeldShipmentMethod" || key === "crid" ||
					key === "mailerId" || key === "heldShipmentMethod" || key === "heldContact") {
					item[key] = item[key] ? item[key] : 0;
					customer[key] = customer[key] ? customer[key] : 0;
					if (customer[key] === item[key]) {
						keyFlag = false
					}
					else {
						keyFlag = true;
						break;
					}
				}
				else {
					let customerValueToCompare = (customer[key] == "" || customer[key] == undefined) ? null : customer[key];
					let itemValueToCompare = (item[key] == "" || item[key] == undefined) ? null : item[key];
	
					if (customerValueToCompare == itemValueToCompare) {
						keyFlag = false;
					} else {
						if(key === "applicationName" || key === "applicationCode"){
							keyFlag = false;
						}
						else{
							keyFlag = true;
							break;
						}						
					}
				}
			}
		
		return keyFlag;
	}



	// To add customer.
	async createCustomer(customer: Customer) {

		// if((customer.applicationName !==null && customer.applicationName !=="") && (customer.applicationCode ==null || customer.applicationCode=="")){
		// 	this.popupService.openAlertDialog("Please enter Application  Code.", "Add Customer", "check_circle", false)
		// }
		// else if((customer.applicationCode !==null && customer.applicationCode !=="") && (customer.applicationName ==null || customer.applicationName=="")){
		// 	this.popupService.openAlertDialog("Please enter Application  Name.", "Add Customer", "check_circle", false)
		// }
		// else{
			this.customerservice.createCustomer(customer).subscribe(res => {
				if (res['message'] == "CUSTOMEREXIST") {
					this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Customer", "check_circle", false)
				}
				else if (res['message'] == "MAILERIDORCRIDEXIST") {
					this.validateMailerIDCRID(customer);
				}
	
				else if (res['message'] == "ok") {
					this.isChangesExists = false;
					this.NavigatetoEditCustomer(this.recentAddedCustID, false);
				} else {
					this.ResetChanges();
				}
			},
				(error) => {
					this.errorService.handleError(error);
				});
		//}
		this.setFocus();	
	}

	//To validate MailerID CRID.
	async validateMailerIDCRID(customer?: Customer) {
		const updateConfirmation = await this.popupService.openConfirmDialog("Mailer ID or CRID already exists. Do you want to continue?", "help_outline", true);
		if (updateConfirmation === "ok") {
			customer.isAllowSave = true;
			if (this.dirtyFlagValidation(this.customerToUpdateArray, customer)) {
				if (this.custName.nativeElement.value != "" && this.custCode.nativeElement.value != ""
					&& this.custName.nativeElement.value != undefined && this.custCode.nativeElement.value != undefined
					&& this.custName.nativeElement.value != null && this.custCode.nativeElement.value != null
					&& this.customerForm.controls['telephone'].value != null && this.customerForm.controls['telephone'].value != ""
					&& this.customerForm.controls['telephone'].value != undefined && this.isChangesExists) {
					if (this.customerIDToUpdate == null && this.isChangesExists) {
						this.createCustomer(customer);
					}
					else if (this.customerIDToUpdate && this.isChangesExists) {
						if (this.addressValidationFrom(customer)) {
							//this.updateCustomer(customer);
							this.modifyCustomer(customer);
						}
					}
				}
				else {
					this.popupService.openAlertDialog("Please enter required fields.", "Add Customer", "check_circle", false)
				}
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Edit Customer", "check_circle", false)
			}
		}
	}

	//Navigate to edit customer screen.
	async NavigatetoEditCustomer(CustID: number, addOrUpdate: boolean) {
		if (addOrUpdate) {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Edit Customer", "check_circle", false);
		} else {
			await this.popupService.openOkAlertDialog(MessageConstants.SAVEMESSAGE, "Add Customer", "check_circle", false);
		}
		await this.LoadDropdowns();
		if(!this.editCustomerDialog){
			await this.getEditCustomerById(CustID, addOrUpdate);
		}		
	}

	//To update customer.
	async updateCustomer(customerObj: Customer) {
		customerObj.customerId = this.customerIDToUpdate;
		if(!customerObj.active){
			let isExist = await this.checkActiveApplications(this.customerIDToUpdate);							
			if(isExist === 'ActiveAppExist'){
				//this.getResponse(customerObj)
				//const userresponse = await this.popupService.openConfirmDialog("All Applications related to this customer will be marked as Inactive,\n Are you sure you want to mark as Inactive anyway? \n  OK :: By clicking on OK customer and application will be marked as Inactive.\n CANCEL :: By clicking on CANCEL only customer will be marked as Inactive.", "help_outline");
				const userresponse = await this.popupService.openConfirmDialog("All Applications of this customer will be marked as inactive.Do you wish to make the Application also inactive ?<br/><br/> "+ "Clicking on OK will mark customer and application as inactive.<br/> Clicking on Cancel will mark the customer as inactive.", "help_outline");								
				if (userresponse === "ok") {
					customerObj.applicationActive  = false;
					this.modifyCustomer(customerObj);
				}
				else {
					this.modifyCustomer(customerObj);
				}
			}else{
				this.modifyCustomer(customerObj);
			}
		}
		else{
			this.modifyCustomer(customerObj);
		}	
	}

	/* async getResponse(customerObj) {
		const userresponse = await this.popupService.openConfirmDialog("All Applications related to this customer will be marked as Inactive,\n Are you sure you want to mark as Inactive anyway? \n  OK :: By clicking on OK customer and application will be marked as Inactive.\n CANCEL :: By clicking on CANCEL only customer will be marked as Inactive.", "help_outline");
		if (userresponse === "ok") {
			customerObj.applicationActive  = 0;
			this.modifyCustomer(customerObj);
		}
		else {
			this.modifyCustomer(customerObj);
		}
	} */

	modifyCustomer(customerObj){
		this.customerservice.updateCustomer(customerObj).subscribe((res) => {
			if (res['message'] == "CUSTOMEREXIST") {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Customer", "check_circle", false)
			}
			else if (res['message'] == "MAILERIDORCRIDEXIST") {
				this.validateMailerIDCRID(customerObj);
			}	
			else if (res['message'] == "ok") {
				this.NavigatetoEditCustomer(customerObj.customerId, true);
				this.isChangesExists = false;
			} else {
				this.ResetChanges();
			}
		},
		(error) => {
			this.errorService.handleError(error);
		});
		this.setFocus();
	}



	//Check Active Applications Exist.
	async checkActiveApplications(custID:number){
		let isExist='';		
		let promise = await new Promise((resolve, reject) => {
			this.applicationservice.checkActiveApplicationExist(custID,0).subscribe(
				result=>{
					console.log(result)
					isExist=result.message;
					resolve(isExist);
				},
				(error)=>{
					reject();
					console.log(error);
				}
			);			
		});
		console.log(isExist)
		return isExist;
	}


	// To reset form data.
	async ResetAddCustomer() {
		if(this.customerIDToUpdate==null && this.checkDirtyFlag() && this.isChangesExists){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (response === "ok") {
				this.ResetChanges();
			}
		}
		else if (this.customerIDToUpdate && this.dirtyFlagValidation(this.customerToUpdateArray, this.buildCustomerObject()) && this.isChangesExists) {
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (response === "ok" && this.customerIDToUpdate) {
				this.ResetChanges();
				await this.getCustomerById(this.customerIDToUpdate);
				this.customerIDToUpdate = null;
				this.isChangesExists = false;
			}
			if (response === "ok" && this.customerIDToUpdate == null) {
				this.ResetChanges();
			}
		} 
		else {			
			this.custName.nativeElement.focus();
			if(this.customerIDToUpdate){
				await this.getCustomerById(this.customerIDToUpdate);
			}			
		}
	}

	//check dirty flag validation
	checkDirtyFlag() {
		let Flag = false;
		//let i = 0;
		if (this.customerForm.value.length > 1) {
			Flag = true;
		} else {
			if (this.customerForm.controls['customerName'].value!== "" || this.customerForm.controls['customerCode'].value!== "" ||
			this.customerForm.controls['telephone'].value !== "" || this.customerForm.controls['fax'].value!== "" ||
			this.customerForm.controls['mailerId'].value !== "" || this.customerForm.controls['crid'].value !== "" ||
			this.customerForm.controls['ivrPhoneNumber'].value !== "" || !this.customerForm.controls['active'].value ||
			this.customerForm.controls['sedc'].value || this.customerForm.controls['ivr'].value ||
			this.customerForm.controls['comment'].value!== "" ) {
				Flag = true;
			}
		}
		return Flag;
	}

	//To clear form.
	ResetChanges() {
		this.isChangesExists = false;
		this.disableSaveForDropdown = false;		
		for (var control in this.customerForm.controls) {
			this.customerForm.controls[control].setValue("");
			this.customerForm.controls[control].setErrors(null);
		}
		this.customerForm.controls['active'].setValue(true);
		this.customerToUpdateArray = [];
		this.InitializeHeldContactsAutoComplete();
		this.initializeAutocompleteShipmentMethod();
		this.InitializeStatesAutoComplete();
		this.setFocus();
		this.pysicalPanelOpenState = false;// panel header content.
		this.heldPanelOpenState = false;// panel header content.
	}

	//To load all dropdowns.
	async LoadDropdowns() {
		await this.loadAllStates();
		await this.loadAllCustomers();
	}

	//To get Customer By customer ID.
	async getCustomerById(customerid: any) {
		if (this.editCustomerDialog) {
			this.showButtons = false;
			this.showPanals = true;
			this.showBackButton = false;
		} else {
			this.showBackButton = true;
			this.showButtons = true;
			this.showPanals = true;
		}
		await this.loadCustomerList(customerid);
		this.customerid = customerid;
	}

	//To populate customer data based on customer ID.
	async loadCustomerList(customerid: number) {
		await this.customerservice.getCustomerById(customerid).subscribe(res => {
			if (!res) { return };
			this.customerToUpdateArray = res[0];
			//this.customerToUpdateArray.applicationName= res.customerName;
			//this.customerToUpdateArray.applicationCode= res.customerCode;
			res = res[0];
			this.customerIDToUpdate = res.customerId;
			this.customerForm.controls['active'].setValue(res.active);
			this.customerForm.controls['sedc'].setValue(res.sedc);
			this.customerForm.controls['ivr'].setValue(res.ivr);
			this.customerForm.controls['telephone'].setValue(res.telephone);
			this.customerForm.controls['fax'].setValue(res.fax);
			this.customerForm.controls['ivrPhoneNumber'].setValue(res.ivrPhoneNumber);
			this.customerForm.controls['mailerId'].setValue(res.mailerId == 0 ? "" : res.mailerId);
			this.customerForm.controls['crid'].setValue(res.crid == 0 ? "" : res.crid);
			this.customerForm.controls['comment'].setValue(res.comment);

			this.customerForm.controls['mailingAddress1'].setValue(res.mailingAddress1);
			this.customerForm.controls['mailingAddress2'].setValue(res.mailingAddress2);
			this.customerForm.controls['mailingCity'].setValue(res.mailingCity);
			this.customerForm.controls['mailingZip'].setValue(res.mailingZip);

			this.customerForm.controls['physicalAddress1'].setValue(res.physicalAddress1);
			this.customerForm.controls['physicalAddress2'].setValue(res.physicalAddress2);
			this.customerForm.controls['physicalCity'].setValue(res.physicalCity);
			this.customerForm.controls['physicalZip'].setValue(res.physicalZip);

			this.customerForm.controls['heldContact'].setValue(res.heldContact == 0 ? "" : res.heldContact);
			this.customerForm.controls['heldAddress1'].setValue(res.heldAddress1);
			this.customerForm.controls['heldAddress2'].setValue(res.heldAddress2);
			this.customerForm.controls['heldCity'].setValue(res.heldCity);
			this.customerForm.controls['heldZip'].setValue(res.heldZip);

			this.customerForm.controls['checkHeldContact'].setValue(res.checkHeldContact == 0 ? "" : res.checkHeldContact);
			this.customerForm.controls['checkHeldAddress1'].setValue(res.checkHeldAddress1);
			this.customerForm.controls['checkHeldAddress2'].setValue(res.checkHeldAddress2);
			this.customerForm.controls['checkHeldCity'].setValue(res.checkHeldCity);
			this.customerForm.controls['checkHeldZip'].setValue(res.checkHeldZip);

			this.customerForm.controls['customerName'].setValue(res.customerName);
			this.customerForm.controls['customerCode'].setValue(res.customerCode);
			this.selectedCustName = res.customerName;
			this.selectedCustCode = res.customerCode;
			this.customerForm.controls['checkHeld1TypeId'].setValue(res.checkHeld1TypeId);
			this.customerForm.controls['held2TypeId'].setValue(res.held2TypeId);
			
			// if(this.editCustomerDialog){
			// 	this.customerForm.controls['mailingState'].setValue(res.mailingState);
			// 	this.customerForm.controls['physicalState'].setValue(res.physicalState);
			// 	this.customerForm.controls['heldState'].setValue(res.heldState);
			// 	this.customerForm.controls['checkHeldState'].setValue(res.checkHeldState);
			// 	this.customerForm.controls['heldShipmentMethod'].setValue(res.heldShipment);
			// 	this.customerForm.controls['checkHeldShipmentMethod'].setValue(res.checkShipment);
			// 	this.customerForm.controls['heldContact'].setValue(res.heldContactName);
			// 	this.customerForm.controls['checkHeldContact'].setValue(res.checkHeldContactName);
			// }
			// else{
				if (this.statesArray.length > 0) {
					for (let item2 of this.statesArray) {
						if (res.mailingState != null) {
							if (item2.stateCode.toLowerCase() === res.mailingState.toLowerCase()) {
								this.customerForm.controls['mailingState'].setValue(item2);
							}
						}
	
						if (res.physicalState != null) {
							if (item2.stateCode.toLowerCase() === res.physicalState.toLowerCase()) {
								this.customerForm.controls['physicalState'].setValue(item2);
							}
						}
	
						if (res.heldState != null) {
							if (item2.stateCode.toLowerCase() === res.heldState.toLowerCase()) {
								this.customerForm.controls['heldState'].setValue(item2);
							}
						}
						if (res.checkHeldState != null) {
							if (item2.stateCode.toLowerCase() === res.checkHeldState.toLowerCase()) {
								this.customerForm.controls['checkHeldState'].setValue(item2);
							}
						}
					}
				}
				if (this.shipmentMethodArray.length > 0 && (res.heldShipmentMethod != null || res.checkHeldShipmentMethod != null)) {
					for (let item3 of this.shipmentMethodArray) {
						let shipmentID1 = +res.heldShipmentMethod;
						let shipmentID2 = +res.checkHeldShipmentMethod;
						if (item3.shipmentMethodID == shipmentID1) {
							this.customerForm.controls['heldShipmentMethod'].setValue(item3);
						}
						if (item3.shipmentMethodID == shipmentID2) {
							this.customerForm.controls['checkHeldShipmentMethod'].setValue(item3);
						}
					}
				}
	
				this.populateContactsInEditCustomer(res);
			//}

		},
			(error) => {
				this.errorService.handleError(error);
			});

	
		//	this.isDisabledSaveBtnInDialog ? this.EnableOrDisableFormControls(false) : this.EnableOrDisableFormControls(this.hasScreenUpdatePriviledge);
			this.EnableOrDisableFormControls(this.hasScreenUpdatePriviledge);
			
			if(this.isEditCustomer && this.hasScreenUpdatePriviledge){
				this.customerForm.controls['customerName'].enable();
				this.customerForm.controls['customerCode'].enable();
			}
			if(this.idFromHome && !(this.isEditCustomer && this.hasScreenUpdatePriviledge)){
				this.customerForm.controls['customerName'].disable();
				this.customerForm.controls['customerCode'].disable();
			}

			if(!(this.isEditCustomer && this.hasScreenUpdatePriviledge) && this.hasScreenReadPriviledge){
				this.customerForm.controls['customerName'].disable();
				this.customerForm.controls['customerCode'].disable();
			}	

		}

		populateContactsInEditCustomer(res){
			if (this.contactsArray.length > 0 && (res.heldContact!=null || res.checkHeldContact!=null)) {
				for (let item4 of this.contactsArray) {
					let hcid = +res.heldContact;
					let chcid = +res.checkHeldContact;
					if (item4.contactID == hcid) {
						this.customerForm.controls['heldContact'].setValue(item4);
					}
					if (item4.contactID == chcid) {
						this.customerForm.controls['checkHeldContact'].setValue(item4);
					}
				}
			}
			else{
				//this.displayFnHeldContacts(res);
				this.customerForm.controls['heldContact'].setValue('');
				this.customerForm.controls['checkHeldContact'].setValue('');
			}
		}


	//To navigate view customer screen.
	async backToViewCustomer() {
		if (this.customerid && !this.isChangesExists) {
			this.router.navigate(['./view_customer']);
			localStorage.setItem("fromEditCustomer", 'clicked');
		}
		else {
			if (!this.dirtyFlagValidation(this.customerToUpdateArray, this.buildCustomerObject()) && !this.isChangesExists) {
				const response = await this.popupService.openConfirmDialog(MessageConstants.BACKMESSAGE, "help_outline");
				if (response === "ok") {
					this.isChangesExists = false;
					this.router.navigate(['./view_customer']);
					localStorage.setItem("fromEditCustomer", 'clicked');
				}
			}
			else{
				this.router.navigate(['./view_customer']);
				localStorage.setItem("fromEditCustomer", 'clicked');
			}
		}
	}

	//To navigate to edit customer screen.
	async getEditCustomerById(custID: any, isCureentCustId: boolean) {
		if (custID && !isCureentCustId) {
			this.customerservice.getAllCustomers(true).subscribe(results => {
				this.recentAddedCustID = results[0].customerId;
				},(error) => {this.errorService.handleError(error);
			});
			if(this.recentAddedCustID){
				await this.router.navigate(['./add_customer', this.recentAddedCustID]);
			}	
		}
		if (custID && isCureentCustId) {
			await this.router.navigate(['./add_customer', custID]);
		}
	}

	//To show mat-errors when form data invalid.
	public hasError = (controlName: string, errorName: string) => {
		return this.customerForm.controls[controlName].hasError(errorName);
	}

	//To validate addresses.
	addressValidationFrom(item) {
		let customerKeys = Object.keys(item);
		let res = true;
		let heldComplete = false;
		let checkHeldComplete = false;
		let physicalComplete = false;
		let mailingComplete = false;
		for (let key of customerKeys) {
			if (key.indexOf('checkHeld') != -1 && checkHeldComplete == false) {
				checkHeldComplete = true;
				if ((item.checkHeld1TypeId != undefined && item.checkHeld1TypeId != 0) || (item.checkHeldAddress1 != null && item.checkHeldAddress1 != "") || (item.checkHeldAddress2 != null && item.checkHeldAddress2 != "")
					|| (item.checkHeldCity != null && item.checkHeldCity != "") || (item.checkHeldState != null && item.checkHeldState != "") ||
					(item.checkHeldZip != null && item.checkHeldZip != "")
				) {
					let sectionName = "Held Address";
					if (item.checkHeld1TypeId != undefined && item.checkHeld1TypeId != 0) {
						sectionName += " - ";
						sectionName += item.checkHeld1TypeId == 1 ? 'Checks' : 'General';
					}
					if (this.validateAddress(sectionName, item.checkHeldAddress1, item.checkHeldAddress2, item.checkHeldCity, item.checkHeldState, item.checkHeldZip)) {
						res = true;
						if (item.checkHeld1TypeId == undefined || item.checkHeld1TypeId == 0) {
							this.popupService.openAlertDialog(sectionName + ": " + "Held Type is required.", "Customer", "check_circle", false);
							res = false;
							return res;
						}
						else if ((((item.checkHeldAddress1 === null || item.checkHeldAddress1 === "") || (item.checkHeldAddress2 === null || item.checkHeldAddress2 === "")) && ((item.checkHeldCity === null || item.checkHeldCity === "")
							|| (item.checkHeldState === null || item.checkHeldState === "") || (item.checkHeldZip === null || item.checkHeldZip === ""))) && (item.checkHeld1TypeId != undefined && item.checkHeld1TypeId != 0)) {
							res = false;
							this.popupService.openAlertDialog(sectionName + ": " + " Address1 or Address2, City, State, and Zip Code are required.", "Customer", "check_circle", true);
							return res;
						}
					}
					else {
						res = false;
						return res;
					}
				}
			}

			if (key.indexOf('held') != -1 && heldComplete == false) {
				heldComplete = true;
				if ((item.heldAddress1 != null && item.heldAddress1 != "") || (item.heldAddress2 != null && item.heldAddress2 != "")
					|| (item.heldCity != null && item.heldCity != "") || (item.heldState != null && item.heldState != "") ||
					(item.heldZip != null && item.heldZip != "") || (item.held2TypeId != undefined && item.held2TypeId != 0)
				) {
					let sectionName = "Held Address";
					if (item.held2TypeId != undefined && item.held2TypeId != 0) {
						sectionName += " - ";
						sectionName += item.held2TypeId == 1 ? 'Checks' : 'General';
					}
					if (this.validateAddress(sectionName, item.heldAddress1, item.heldAddress2, item.heldCity, item.heldState, item.heldZip)) {
						res = true;
						if (item.held2TypeId == undefined || item.held2TypeId == 0) {
							this.popupService.openAlertDialog(sectionName + ": " + "Held Type is required.", "Customer", "check_circle", false);
							res = false;
							return res;
						}

						else if ((((item.heldAddress1 === null || item.heldAddress1 === "") || (item.heldAddress2 === null || item.heldAddress2 === "")) && ((item.heldCity === null || item.heldCity === "")
							|| (item.heldState === null || item.heldState === "") || (item.heldZip === null || item.heldZip === ""))) && (item.held2TypeId != undefined && item.held2TypeId != 0)) {
							res = false;
							this.popupService.openAlertDialog(sectionName + ": " + " Address1 or Address2, City, State, and Zip Code are required.", "Customer", "check_circle", true);
							return res;
						}
					}
					else {
						res = false;
						return res;
					}
				}
			}
			if (key.indexOf('mailing') != -1 && mailingComplete == false) {
				mailingComplete = true;
				if ((item.mailingAddress1 != null && item.mailingAddress1 != "") || (item.mailingAddress2 != null && item.mailingAddress2 != "")
					|| (item.mailingCity != null && item.mailingCity != "") || (item.mailingState != null && item.mailingState != "") ||
					(item.mailingZip != null && item.mailingZip != "")
				) {
					if (this.validateAddress("Mailing Address", item.mailingAddress1, item.mailingAddress2, item.mailingCity, item.mailingState, item.mailingZip)) {
						res = true;

					}
					else {
						res = false;
						return res;
					}
				}
			}
			if (key.indexOf('physical') != -1 && physicalComplete == false) {
				physicalComplete = true;
				if ((item.physicalAddress1 != null && item.physicalAddress1 != "") || (item.physicalAddress2 != null && item.physicalAddress2 != "")
					|| (item.physicalCity != null && item.physicalCity != "") || (item.physicalState != null && item.physicalState != "") ||
					(item.physicalZip != null && item.physicalZip != "")
				) {
					if (this.validateAddress("Physcial Address", item.physicalAddress1, item.physicalAddress2, item.physicalCity, item.physicalState, item.physicalZip)) {
						res = true;
					}
					else {
						res = false;
						return res;
					}
				}
			}
			if (key.indexOf('checkHeld') == -1 && key.indexOf('held') == -1 && key.indexOf('mailing') == -1 && key.indexOf('physical') == -1) {
				if ((item.checkHeldAddress1 === null || item.checkHeldAddress1 === "") && (item.checkHeldAddress2 === null || item.checkHeldAddress2 === "")
					&& (item.checkHeldCity === null || item.checkHeldCity === "") && (item.checkHeldState === null || item.checkHeldState === "") &&
					(item.checkHeldZip === null || item.checkHeldZip === "")

					&& (item.heldAddress1 === null || item.heldAddress1 === "") && (item.heldAddress2 === null || item.heldAddress2 === "")
					&& (item.heldCity === null || item.heldCity === "") && (item.heldState === null || item.heldState === "") &&
					(item.heldZip === null || item.heldZip === "")

					&& (item.mailingAddress1 === null || item.mailingAddress1 === "") && (item.mailingAddress2 === null || item.mailingAddress2 === "")
					&& (item.mailingCity === null || item.mailingCity === "") && (item.mailingState === null || item.mailingState === "") &&
					(item.mailingZip === null || item.mailingZip === "")

					&& (item.physicalAddress1 === null || item.physicalAddress1 === "") && (item.physicalAddress2 === null || item.physicalAddress2 === "")
					&& (item.physicalCity === null || item.physicalCity === "") && (item.physicalState === null || item.physicalState === "") &&
					(item.physicalZip === null || item.physicalZip === "")

					&& (item.checkHeld1TypeId == undefined || item.checkHeld1TypeId == 0) && (item.held2TypeId == undefined || item.held2TypeId == 0)
				) {
					return res;
				}
			}

		}
		return res;

	}

	validateAddress(section, address1, address2, city, state, zip) {
		var item = this.customerForm.value;
		let valid = true;
		if ((((address1 != null && address1 != "") || (address2 != null && address2 != "")) && ((city != null && city != "")
			&& (state != null && state != "") && (zip != null && zip != "")))) {
			valid = true;
		}

		else if ((((address1 != null && address1 != "") || (address2 != null && address2 != "")) && ((city === null || city === "")
			|| (state === null || state === "") || (zip === null || zip === "")))) {
			valid = false;
			if (section == "Physcial Address" || section == "Mailing Address") {
				this.popupService.openAlertDialog(section + ": " + " City, State, and Zip Code are required.", "Customer", "check_circle", true);
			}
			else if ((item.checkHeld1TypeId === undefined || item.checkHeld1TypeId === 0) || (item.held2TypeId === undefined || item.held2TypeId === 0)) {
				this.popupService.openAlertDialog(section + ": " + " Held Type, City, State, and Zip Code are required.", "Customer", "check_circle", true);
			}
			else {
				this.popupService.openAlertDialog(section + ": " + " City, State, and Zip Code are required.", "Customer", "check_circle", true);
			}

		}

		else if ((((address1 === null || address1 === "") || (address2 === null || address2 === "")) && ((city != null && city != "")
			&& (state != null && state != "") && (zip != null && zip != "")))) {
			valid = false;
			if (section == "Physcial Address" || section == "Mailing Address") {
				this.popupService.openAlertDialog(section + ": " + "Address1 or Address2 is required.", "Customer", "check_circle", true);
			}
			else if ((item.checkHeld1TypeId === undefined || item.checkHeld1TypeId === 0) || (item.held2TypeId === undefined || item.held2TypeId === 0)) {
				this.popupService.openAlertDialog(section + ": " + " Held Type and Address1 or Address2 is required.", "Customer", "check_circle", true);
			}
			else {
				this.popupService.openAlertDialog(section + ": " + "Address1 or Address2 is required.", "Customer", "check_circle", true);
			}
		}

		else if ((((address1 === null || address1 === "") || (address2 === null || address2 === "")) && ((city != null && city != "")
			|| (state != null && state != "") || (zip != null && zip != "")))) {
			valid = false;
			if (section == "Physcial Address" || section == "Mailing Address") {
				this.popupService.openAlertDialog(section + ": " + "Address1 or Address2, City, State, and Zip Code are required.", "Customer", "check_circle", true);
			}
			else if ((item.checkHeld1TypeId === undefined || item.checkHeld1TypeId === 0) || (item.held2TypeId === undefined || item.held2TypeId === 0)) {
				this.popupService.openAlertDialog(section + ": " + "Held Type, Address1 or Address2, City, State, and Zip Code are required.", "Customer", "check_circle", true);
			}
			else {
				this.popupService.openAlertDialog(section + ": " + "Address1 or Address2, City, State, and Zip Code are required.", "Customer", "check_circle", true);
			}
		}
		return valid;
	}


	// To open contact screen.
	createcontact() {
		if ((!(this.customerForm.get('customerCode').value)) || (!(this.customerForm.get('customerName').value))) {
			this.popupService.openAlertDialog("Please select either Customer Name or Customer Code.", "Customer", "check_circle", false);
		}
		else {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = false;
			dialogConfig.maxWidth = "90vw";
			if (this.editCustomerDialog) {
				this.customerFromHome = true;
			} else {
				this.customerFromHome = false;
			}
			dialogConfig.data = {
				title: "Contacts",
				customerName: this.selectedCustName,
				customerCode: this.selectedCustCode,
				customerID: this.customerIDToUpdate,
				customerTelephone: this.customerForm.get('telephone').value,
				customerFromHome: this.customerFromHome,
				customerReadPrivilege: this.hasScreenReadPriviledge,
				customerUpdatePrivilege: this.hasScreenUpdatePriviledge
			};
			const dialogRef = this.dialog.open(ContactDialogComponent, dialogConfig);

			dialogRef.afterClosed().subscribe(result => {
				if (result === true) {
					this.loadAllContacts();
				}
			});
		}
	}

	//To open service Agreement sreen.
	OpenServiceAgreementDialog() {
		if ((!(this.customerForm.get('customerCode').value)) || (!(this.customerForm.get('customerName').value))) {
			this.popupService.openAlertDialog("Please select either Customer Name or Customer Code", "Customer", "check_circle");
		}
		else {
			let custType = "Arista";
			if (this.customerForm.controls['sedc'].value == true) {
				custType = "SEDC";
			}
			const servicedialog = new MatDialogConfig();
			servicedialog.disableClose = true;
			servicedialog.autoFocus = true;
			servicedialog.width = "1500px";
			if (this.editCustomerDialog) {
				this.customerFromHome = true;
			} else {
				this.customerFromHome = false;
			}
			servicedialog.data = {
				title: "Service Agreement",
				customerName: this.custName.nativeElement.value.trim(),
				customerCode: this.custCode.nativeElement.value.trim(),
				customerID: this.customerIDToUpdate,
				customerType: custType,
				btndisable: false,
			};
			const servicedialogConfig = this.dialog.open(ServiceAgreementDialogComponent, servicedialog);
		}
	}

	//To open add application screen.
	openApplicationScreen() {
		let custName = this.selectedCustName;
		let custCode = this.selectedCustCode;
		this.router.navigate(['./add_application', custName, custCode, this.customerIDToUpdate]);

		/* if ((!(this.customerForm.get('customerCode').value)) || (!(this.customerForm.get('customerName').value))) {
			this.popupService.openAlertDialog("Please select either Customer Name or Customer Code", "Customer", "check_circle");
		}
		else{
			const applicationDialogConfig = new MatDialogConfig();
			applicationDialogConfig.disableClose = true;
			applicationDialogConfig.autoFocus = false;
			applicationDialogConfig.height = "710px";
			applicationDialogConfig.data = {
				title:"Application",
				custName:this.selectedCustName,
				custCode:this.selectedCustCode,
				customerIDToUpdate:this.customerIDToUpdate,
				editApplicationDialogShow: true,
			}
			const applicationDialog = this.dialog.open(AddApplicationNewComponent, applicationDialogConfig)
		} */
	}

	



//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return !(this.dirtyFlagValidation(this.customerToUpdateArray, this.buildCustomerObject()) && this.isChangesExists);
	}


	scrollToDown() {
		var elmnt = document.getElementById("matCardCustomerHeldAddressMoveSmooth");
		elmnt.scrollIntoView({ behavior: "smooth" });
	}
}

