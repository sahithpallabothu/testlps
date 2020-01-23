import { Component, OnInit, ViewChild, ElementRef, QueryList, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormControl, FormBuilder, FormArray, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator, MatRadioButton, MatRadioGroup, ErrorStateMatcher } from '@angular/material';
import { ApplicationService } from '@/businessservices/application/application.service';
import { Application } from '@/businessclasses/Application/application';
import { AddcustomerComponent } from '@/businesscomponents/Customer/addcustomer/addcustomer.component';
import { Observable, empty } from 'rxjs';
import { PopupDialogService } from '../../../shared/popup-dialog.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { CustomerService } from '@/businessservices/customer/customer.service';
import { Customer } from '@/businessclasses/Customer/customer';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MessageConstants } from '@/shared/message-constants';
import { DatePipe } from '@angular/common';
import { UserPrivilegesService } from '../../../_services/userprivilege.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { SpaceValidator } from '@/shared/spaceValidator';
import { Inserts } from '@/businessclasses/Inserts/Insert';
import { InsertType } from '@/businessclasses/Inserts/Insert-Type';
import { InsertService } from '../../../businessservices/insert/insert.service';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
import { PrintLocation } from '@/businessclasses/Application/location';
import { Session } from 'protractor';

@Component({
	selector: 'app-addinsert-dialog',
	templateUrl: './addinsert-dialog.component.html',
	styleUrls: ['./addinsert-dialog.component.css'],

})

export class AddinsertDialogComponent implements OnInit {
	allInserts: Observable<Inserts[]>;
	allInsertsForTemp: Observable<Inserts[]>;
	allInsertTypes: Observable<InsertType[]>;
	insertIDToUpdate: number = -1;
	isApplicationNameValid: boolean = false;
	lengthofInsertsBeforeAdding: number;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	applicationList: Application[] = [];
	selectedApplicationDetails: any;
	filteredOptions: Observable<Application[]>;
	applicationDetails: Observable<Application[]>;
	application: Application[] = [];
	applicationArray = [];
	title: string;
	InsertsList = [];
	startDateFromViewInserts: string;
	endDateFromViewInserts: string;
	InsertsTypeList = [];
	tempDelInsert = [];
	todayDate: Date = new Date();
	location1: string = "";
	locationArray:PrintLocation[];
	allLocations:Observable<PrintLocation[]>;
	errorMessageForDateValidation: string;
	isChangesExists: boolean = false;
	customerList: Observable<Customer[]>;
	names: Customer[] = [];
	firstTimeInUpdate: boolean = true;
	customerArray = [];
	insertDataToCompare = [];
	isUpdate = false;
	tIndex = -1;
	titleOfInsertPopUp:string;
	@ViewChildren('formRow') rows: QueryList<any>;
	@ViewChildren('retQty') returnQty: QueryList<any>;
	@ViewChildren('endDate') endDate: QueryList<any>;
	datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	isSearchVisible: boolean = true;
	constructor(private _fb: FormBuilder,
		public element: ElementRef<HTMLElement>,
		private popupService: PopupDialogService,
		private popupMessageService: PopupMessageService,
		private customerservice: CustomerService,
		private applicationservice: ApplicationService,
		private dialog: MatDialog,
		private route: ActivatedRoute,
		private errorService: ErrorHandlerService,
		private router: Router,
		private _location: Location,
		private insertService: InsertService,
		private userprevilege: UserPrivilegesService,
		private datePipe: DatePipe,
		private dialogRef: MatDialogRef<AddinsertDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data) {
		this.setPriveligies();
		this.title = data.title;
	}
	public AdditionalInsertsForm: FormGroup;
	insertsForm: FormGroup;
	applicationID: any;
	showUsedQuantity: boolean = false;
	applicationCodeValue: string;
	locationValue: string
	dataOfInserts: Inserts[] = [];
	userLocation:string;

	//to set privileges.
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	hasScreenDeletePriviledge: boolean = false;
	isAllowSave: boolean = true;
	selectedApplicationInsertType: string;
	ngOnInit() {
		//to load all locations
		this.loadAllLocations();
		this.loadApplicationList();
		this.loadAllInsertTypes();
		this.applicationID = this.route.snapshot.paramMap.get('id');
        this.titleOfInsertPopUp="Add Inserts"
		this.insertsForm = this._fb.group({
			insertsCustomerName: [],
			insertsCustomerCode: [],
			insertsApplicationName: [],
			insertsApplicationCode: []
		});

		this.initializeTheInsertForm();
		//from view inserts
		if (this.applicationID != null) {
			this.tempDelInsert = [];
			this.titleOfInsertPopUp="Edit Inserts"
			this.selectedApplicationInsertType = this.route.snapshot.paramMap.get('insertType');
			this.startDateFromViewInserts = this.route.snapshot.paramMap.get('startDate');
			this.endDateFromViewInserts = this.route.snapshot.paramMap.get('endDate');
			let Date1 = this.startDateFromViewInserts.split('-');
			let Date2 = this.endDateFromViewInserts.split('-');
			this.startDateFromViewInserts = Date1.join('/');
			if (this.startDateFromViewInserts == "00/00/00") {
				this.startDateFromViewInserts = null;
			}
			this.endDateFromViewInserts = Date2.join('/');
			if (this.endDateFromViewInserts == "00/00/00") {
				this.endDateFromViewInserts = null;
			}
			this.isSearchVisible = false;
			this.loadInserts(this.applicationID, this.startDateFromViewInserts, this.endDateFromViewInserts);
		}
		this.setSaveBtnEnable();
		
	}

	public ngAfterContentInit() {
		this.setFocus();
	}

	displayFn(user?: Application): string | undefined {
		return user ? user.applicationCode : undefined;
	}
	private _filter(name: any): Application[] {
		let filterValue;
		if (typeof name === 'string')
			filterValue = name.toLowerCase();
		else
			filterValue = name;
		this.selectedApplicationDetails = this.applicationList.filter(option => option.applicationName.toLowerCase());
		return this.applicationList.filter(option => option.applicationName.toLowerCase().indexOf(filterValue) === 0);
	}
	//to check if any filed value is changed
	isChange(controlName: string) {
		this.isChangesExists = true;
	}
 
	//to restrict textbox from entering negative values
	checkNegativeValue(event) {
		return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57
	}
	loadAllLocations(){
		 let userData=JSON.parse(sessionStorage.getItem('currentUser'));
		 this.userLocation='D';
		//locationId
		this.allLocations = this.applicationservice.getLocations();
		this.allLocations.subscribe(results => {
			if (!results) { return };
			this.locationArray = results;
			this.locationArray.sort((a, b) => (a.description.toLowerCase() > b.description.toLowerCase()) ? 1 : ((b.description.toLowerCase() > a.description.toLowerCase()) ? -1 : 0));
			let index=this.locationArray.findIndex(x=>x.locationId==userData.locationId);
			if(index!=-1){
				this.userLocation=this.locationArray[index].code;
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//to set privileges for insert
	setPriveligies() {
		//Set Department screen privileges
		if (this.userprevilege.hasUpdateScreenPrivileges(Constants.insertsScreenName)) {
			this.hasScreenUpdatePriviledge = true;
		}
		if (this.userprevilege.hasInsertScreenPrivileges(Constants.insertsScreenName)) {
			this.hasScreenInsertPriviledge = true;
		}
		if (this.userprevilege.hasDeleteScreenPrivileges(Constants.insertsScreenName)) {
			this.hasScreenDeletePriviledge = true;
		}
	}

	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.applicationID == null) {
			this.isAllowSave = false;
		} else if (this.hasScreenUpdatePriviledge && this.applicationID !== null) {
			this.isAllowSave = false;
		} else {
			this.isAllowSave = true;
		}
	}

	async isChangeInReturn(controlName, itemrow, event) {
		this.isChange(controlName);
		if (event.target.checked) {
			itemrow.controls['returnedQuantity'].enable();
			//this.setFocusToReturnQty();
			this.returnQty.last.nativeElement.focus();
		} else {
			let checkBoxConfirmation = await this.popupMessageService.openConfirmDialog("You are trying to change RTN. \n Are you sure you want to change?", "help_outline");
			if (checkBoxConfirmation === "ok") {
				itemrow.controls['returnedQuantity'].setValue("");
				itemrow.controls['returnedQuantity'].disable();
			} else {
				itemrow.controls['returnInInserts'].setValue(1);
				this.returnQty.last.nativeElement.focus();
				//this.setFocusToReturnQty();
			}
		}
	}

	// dynamic row start
	get formArr() {
		return this.AdditionalInsertsForm.get('itemRows') as FormArray;
	}
	async backToHome() {

		if(!this.isFieldsSame() ){
			const updateConfirmation = await this.popupMessageService.openConfirmDialog(MessageConstants.BACKMESSAGE, "help_outline");
				if (updateConfirmation === "ok") {
					this._location.back();
					localStorage.setItem("backButtonClicked", 'clicked');
				}
		}else{
			this._location.back();
					localStorage.setItem("backButtonClicked", 'clicked');
		}	

	}
	//validate white space start
	public ValidateSpacesInInsert(control: FormControl) {
		let isSpace;
		let isValid;
		if (control.value != null && control.value.length !== 0) {
			isSpace = (control.value['applicationCode'] || '').trim().length === 0;
			let splitted = (control.value['applicationCode'] || control.value).split(" ");
			// Start Space
			let firststring = splitted[0];
			// End Space
			let laststring = splitted[splitted.length - 1];
			isSpace = firststring.trim().length === 0;
			if (isSpace) {
				isValid = !isSpace;
				return isValid ? null : { 'space': true };
			}
			isSpace = laststring.trim().length === 0;
			isValid = !isSpace;
		}
		else {
			isValid = true;
		}
		return isValid ? null : { 'space': true };
	}
	//validate white space end

	public initItemRows() {
		return this._fb.group({
			applicationCode: ['', [Validators.required, this.ValidateSpacesInInsert, Validators.maxLength(4)]],
			applicationCode1: [''],
			startDateInInserts: ['', [Validators.required, Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			startDateInInserts1: [''],
			endDateInInserts: ['', [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			endDateInInserts1: [''],
			type: ['', [Validators.required]],
			number: [{ value: '', disabled: true }],
			returnInInserts: [''],
			usedQuantity: [''],
			weight: [''],
			returnedQuantity: [{ value: '', disabled: true }],
			reorderQuantity: [''],
			receivedQuantity: [''],
			receivedDate: ['', [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			receivedDate1: [''],
			receivedBy: ['', [this.ValidateSpacesInInsert, Validators.maxLength(50)]],
			description: ['', [this.ValidateSpacesInInsert, Validators.maxLength(255)]],
			code: [''],
			locationInInserts: ['',[Validators.required]],
			binLocation: ['', [this.ValidateSpacesInInsert, Validators.maxLength(50)]],
			insertActiveCheckBox: [true],
			showAddButton: false,
			showDeleteButton: false,
			inUpdate: false,
			insertRecordId: -1
		});
	}

	onTypeChange(itemrow, event) {
		let selectedInsert = this.InsertsTypeList.find(x => x.insertTypeId === event.value)
		if (selectedInsert["description"] === "Global") {
			itemrow.controls['number'].enable();
		} else {
			itemrow.controls['number'].setValue("");
			itemrow.controls['number'].disable();
		}
		this.isChange('type')
	}

	invalidStartDate: boolean;
	addNewRow(itemrow, fromFormSubmit: boolean = false) {
		let now = new Date();
		now.setDate(now.getDate() - 1);
		let flag = 0;
		let currentApplicationcodeValue = (itemrow.controls['applicationCode'].value["applicationCode"] || itemrow.controls['applicationCode'].value);
		let insertTypeValue = itemrow.controls['type'].value;
		let startDate = itemrow.controls['startDateInInserts'].value;
		let endDate = itemrow.controls['endDateInInserts'].value;
		let active = itemrow.controls['insertActiveCheckBox'].value ? 1 : 0;
		let insertNumber = (itemrow.controls['number'].value === null || itemrow.controls['number'].value === "") ? 0 : itemrow.controls['number'].value;
		for (var i = 0; i < this.AdditionalInsertsForm.value.itemRows.length; i++) {
			if (this.AdditionalInsertsForm.value.itemRows[i].applicationCode === null
				|| this.AdditionalInsertsForm.value.itemRows[i].applicationCode === ""
				|| this.AdditionalInsertsForm.value.itemRows[i].startDateInInserts === ""
				|| this.AdditionalInsertsForm.value.itemRows[i].startDateInInserts === null
				|| this.AdditionalInsertsForm.value.itemRows[i].type === ""
			) {
				flag++;
			}
		}
		if (flag === 0) {
			/*To Check if application code is valid*/
			if (this.isApplicationCodeValid(itemrow)) {
				if (this.checkDates()) {
					if (this.checkIfDatesAboveCurrentDate()) {
						//this.addRowToInsert(itemrow,i,now,fromFormSubmit)
						/*condition to check if selective already exists start*/
						let selectedInsert = this.InsertsTypeList.find(x => x.insertTypeId === itemrow.controls['type'].value)
						if (selectedInsert["description"] === "Global" && !itemrow.controls['number'].value) {
							itemrow.controls['number'].setValue(1);
							insertNumber = 1;
						}
						//in update inserts
						let end = this.AdditionalInsertsForm.controls.itemRows['controls'].length;
						if(this.applicationID){
                              if(fromFormSubmit){
									this.checkAllControlsInFrontEnd(end,itemrow,fromFormSubmit,i,now)
							  }else{
                                if (this.checkSelectiveInFrontEnd(itemrow, -1,0)) {
									//this.addRowToInsert(itemrow, i, now, fromFormSubmit)
									this.checkLocationForInsert(itemrow, i, now, fromFormSubmit);
									this.scrollToDown();
									
								}else {
									this.popupMessageService.openAlertDialog("An Insert record of the same type for this Application already exists during the given period. ",this.titleOfInsertPopUp, "check_circle", false);
								}
							  }
						}
						//In addInserts
						else{
							//check whether itemrow exists in database
                            this.insertService.checkInsertTypeExist(currentApplicationcodeValue, insertTypeValue, insertNumber, active, startDate, endDate)
							.subscribe(isFound => {
								if (!isFound) {
									if(fromFormSubmit){
										this.checkAllControlsInFrontEnd(end,itemrow,fromFormSubmit,i,now)
								  }else{
									if (this.checkSelectiveInFrontEnd(itemrow, -1,0)) {
										this.checkLocationForInsert(itemrow, i, now, fromFormSubmit);
									}else {
										this.popupMessageService.openAlertDialog("An Insert record of the same type for this Application already exists during the given period. ",this.titleOfInsertPopUp, "check_circle", false);
									}
								  }
								} else {
									this.popupMessageService.openAlertDialog("An Insert record of the same type for this Application already exists during the given period.",this.titleOfInsertPopUp, "check_circle", false);
								}
							},
								(error) => {
									this.errorService.handleError(error);
								});
						/*condition to check if selective already exists end*/
						}
					} else {
						this.popupMessageService.openAlertDialog(this.errorMessageForDateValidation,this.titleOfInsertPopUp, "check_circle", false);
					}
				}
				else {
					this.popupMessageService.openAlertDialog(this.errorMessageForDateValidation, this.titleOfInsertPopUp, "check_circle", false);
				}
			} else {
				this.popupMessageService.openAlertDialog("Invalid App.",this.titleOfInsertPopUp, "check_circle", false);
			}
		} else {
			this.popupMessageService.openAlertDialog("App, Start Date, Type and Active are required.",this.titleOfInsertPopUp, "check_circle", false);
		}
	}


	async checkLocationForInsert(itemrow, i, now, fromFormSubmit){
		if(this.userLocation!=itemrow.controls['locationInInserts'].value)  {
			await this.popupMessageService.openOkAlertDialog("The Application print location is different than the logged-in User's location. ",this.titleOfInsertPopUp, "check_circle", true);
			this.addRowToInsert(itemrow, i, now, fromFormSubmit)
		}
		else{
			let appdata=itemrow.controls['applicationCode'].value;
			if(typeof appdata=='object'){
				appdata=appdata.applicationCode;
			}
			let index=this.applicationList.findIndex(x=>x.applicationCode==appdata);
			if(this.applicationList[index].printLocation!=itemrow.controls['locationInInserts'].value){
			await this.popupMessageService.openOkAlertDialog("The selected location on the screen is different than the Application print location. ",this.titleOfInsertPopUp, "check_circle", true);
				this.addRowToInsert(itemrow, i, now, fromFormSubmit)
			}else{
				this.addRowToInsert(itemrow, i, now, fromFormSubmit)
			}
		}
	}



	checkAllControlsInFrontEnd(end,itemrow,fromFormSubmit,i,now){
		
		let isDateValid:boolean=true;
		for (let k=0;k<end;k++){
			itemrow = this.AdditionalInsertsForm.controls.itemRows['controls'][k];
			if (!this.checkSelectiveInFrontEnd(itemrow,end,k+1) && k!=end-1) {
				isDateValid=false
			}
			else if(k==end-1 && !this.checkSelectiveInFrontEnd(itemrow,-1,0)){
				isDateValid=false
			}
		}
		if (isDateValid) {
			this.checkLocationForInsert(itemrow, i, now, fromFormSubmit);
			//this.addRowToInsert(itemrow, i, now, fromFormSubmit)
		} else {
			this.popupMessageService.openAlertDialog("An Insert record of the same type for this Application already exists during the given period. ", this.titleOfInsertPopUp, "check_circle", false);
		}
	}

	addRowToInsert(itemrow, i, now, fromFormSubmit) {
			let returnValue = itemrow.controls['returnInInserts'].value;
			returnValue = (returnValue === "" || returnValue === null || returnValue === false) ? false : true;
			if (returnValue && (itemrow.controls['returnedQuantity'].value === "" || itemrow.controls['returnedQuantity'].value === null)) {
				this.popupMessageService.openAlertDialog("RTN QTY is required.",this.titleOfInsertPopUp, "check_circle", false);
			}
			else {
				let location = "D";
				for (let details of this.applicationList) {
					if ((itemrow.controls['applicationCode'].value["applicationCode"] || itemrow.controls['applicationCode'].value).toLowerCase().trim() === details['applicationCode'].toLowerCase()) {
						if (details['printLocation'] === 'W') {
							location = "W";
							break;
						}
					}
				}
				if (this.applicationID == null || this.applicationID == "") {
					// if (location === "D") {
					// 	itemrow.controls['locationInInserts'].setValue("D");
					// } else {
					// 	itemrow.controls['locationInInserts'].setValue("W");
					// }
					//itemrow.controls['locationInInserts'].disable();
				}

				if (!fromFormSubmit) {
					this.formArr.push(this.initItemRows());
					this.setFocus();
					if (this.AdditionalInsertsForm.value.itemRows[i - 1].startDateInInserts1 > now) {
						if (!fromFormSubmit) {
							itemrow.showDeleteButton = true;
						}
					}
					this.filteredOptions = this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].valueChanges.pipe(
						startWith(''),
						map(value => typeof value === 'string' ? value : value),
						map(name => name ? this._filter(name) : this.applicationList.slice())
					);
					this.AdditionalInsertsForm.controls.itemRows['controls'][i - 1].controls["applicationCode"].disable();
					//to verify date condition
					if (new Date(this.AdditionalInsertsForm.value.itemRows[i - 1].startDateInInserts1) < now) {
						this.AdditionalInsertsForm.controls.itemRows['controls'][i - 1].controls["startDateInInserts"].disable();
						this.AdditionalInsertsForm.controls.itemRows['controls'][i - 1].controls["startDateInInserts1"].disable();
					}
					//to show delete button from next control
					this.AdditionalInsertsForm.controls.itemRows['controls'][i].showDeleteButton = true;
					this.AdditionalInsertsForm.controls.itemRows['controls'][i - 1].controls["type"].disable();
					this.AdditionalInsertsForm.controls.itemRows['controls'][i - 1].controls["number"].disable();
					itemrow.showAddButton = true;
					//in edit mode application code will be the row which is clicked
					if (this.applicationID != null) {
						this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].setValue({ applicationCode: this.applicationCodeValue });
						//for tb app.code in edit mode
						this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode1"].setValue(this.applicationCodeValue);
						//end for tb
						if (this.locationValue === "D") {
							this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].setValue("D");
						} else {
							this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].setValue("W");
						}
						this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].disable();
						//for tb app.code in edit mode
						this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode1"].disable();
						//end for tb
					//	this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].disable();
					}
				}
				else if(fromFormSubmit) {
					this.performAddOrUpdate();
				}
			}
	}

	
	checkSelectiveInFrontEnd(itemrow, end,i) {
		let selectiveExist: boolean = true;
		let itemrowApplicationcode: string;
		let itemRowActiveStatus = itemrow.controls['insertActiveCheckBox'].value;
		itemRowActiveStatus = (itemRowActiveStatus === "true" || itemRowActiveStatus === true) ? true : false;
		let itemrowSelectiveValue = itemrow.controls['type'].value + ((itemrow.controls['number'].value != null && itemrow.controls['number'].value != "") ? itemrow.controls['number'].value.toString() : "");
		let itemRowStartDate = itemrow.controls['startDateInInserts'].value;
		let itemRowEndDate = itemrow.controls['endDateInInserts'].value;
		if (this.applicationID != null) {
			/*Check for selective front end validation in update inserts*/
			if (end === -1) {
				/*check for front end validation during add New Row*/
				end = this.AdditionalInsertsForm.controls.itemRows['controls'].length - 1;
			}
			for (let k = i; k < end; k++) {
				let currentrowActiveStatus = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("insertActiveCheckBox").value;
				currentrowActiveStatus = (currentrowActiveStatus === "true" || currentrowActiveStatus === true) ? true : false;
				let currentRowSelectiveValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("type").value +
					((this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("number").value != null && this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("number").value != "") ? this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("number").value.toString() : "");
				let currentRowEndDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("endDateInInserts").value;
				let currentRowStartDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("startDateInInserts").value;
				if ((itemRowActiveStatus === currentrowActiveStatus) && (itemrowSelectiveValue === currentRowSelectiveValue)) {
					
					if (!currentRowEndDate && !itemRowEndDate) {
						selectiveExist = false;
						break;
					}
					if(!itemRowEndDate && new Date(itemRowStartDate)<=new Date(currentRowEndDate)){
						selectiveExist = false;
						break;
					}
					
					if ((itemRowStartDate && currentRowStartDate && itemRowEndDate && currentRowEndDate)
								&&
						(new Date(itemRowStartDate) >= new Date(currentRowStartDate)
						&& new Date(itemRowStartDate) <= new Date(currentRowEndDate))
						||
						(new Date(itemRowEndDate) >= new Date(currentRowStartDate)
							&& new Date(itemRowEndDate) <= new Date(currentRowEndDate))) {
						selectiveExist = false;
						break;
					}
				}
			}
		} else {
			/*check for selective front end validation for add inserts */
			itemrowApplicationcode = (itemrow.controls['applicationCode'].value["applicationCode"] || itemrow.controls['applicationCode'].value).toLowerCase().trim();
			if (end === -1) {
				/*check for front end validation during add New Row*/
				end = this.AdditionalInsertsForm.controls.itemRows['controls'].length - 1;
			}
			for (let k = i; k < end; k++) {
				let currentRowApplicationCode = (this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("applicationCode").value["applicationCode"] || this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("applicationCode").value).toLowerCase().trim();
				let currentrowActiveStatus = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("insertActiveCheckBox").value;
				currentrowActiveStatus = (currentrowActiveStatus === "true" || currentrowActiveStatus === true) ? true : false;
				let currentRowSelectiveValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("type").value +
					((this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("number").value != null && this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("number").value != "") ? this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("number").value.toString() : "");
				let currentRowEndDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("endDateInInserts").value;
				let currentRowStartDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("startDateInInserts").value;
				if (itemrowApplicationcode === currentRowApplicationCode && (itemRowActiveStatus === currentrowActiveStatus) && (itemrowSelectiveValue === currentRowSelectiveValue)) {
					
					if (!currentRowEndDate && !itemRowEndDate) {
						selectiveExist = false;
						break;
					}
					if(!itemRowEndDate && new Date(itemRowStartDate)<=new Date(currentRowEndDate)){
						selectiveExist = false;
						break;
					}
					if ((itemRowStartDate && currentRowStartDate && itemRowEndDate && currentRowEndDate)
						     &&
						(new Date(itemRowStartDate) >= new Date(currentRowStartDate)
						&& new Date(itemRowStartDate) <= new Date(currentRowEndDate))
						||
						(new Date(itemRowEndDate) >= new Date(currentRowStartDate)
							&& new Date(itemRowEndDate) <= new Date(currentRowEndDate))) {
						selectiveExist = false;
						break;
					}
				}
			}
		}
		return selectiveExist;
	}

	//to check if application code is valid
	isApplicationCodeValid(itemrow) {
		let isExist: boolean;
		for (let value of this.applicationList) {
			if (value['applicationCode'].toLowerCase().trim() === (itemrow.controls['applicationCode'].value["applicationCode"] || itemrow.controls['applicationCode'].value).toLowerCase().trim()) {
				isExist = true;
			}
		}
		return isExist;
	}
	// validates start and end dates
	checkDates(): boolean {
		this.errorMessageForDateValidation = "";
		let n = this.AdditionalInsertsForm.controls.itemRows['controls'].length;
		let isValid = true;
		for (let k = 0; k < n; k++) {
			let currentEndDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("endDateInInserts").value;
			let currentStartDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("startDateInInserts").value;
			currentEndDate = currentEndDate != "" && currentEndDate != null ? currentEndDate : "";
			if (currentStartDate === null || currentStartDate === "") {
				isValid = false;
				this.errorMessageForDateValidation = "Start Date is required";
				break;
			}
			if (currentEndDate) {
				let date = new Date();
				date.setDate(date.getDate() - 1)
				if (date > new Date(currentEndDate)) {
					isValid = false;
					this.errorMessageForDateValidation = "End Date must be greater than or equal to Current Date.";
					break;
				}
			}
			if (currentEndDate && currentStartDate) {
				if (new Date(currentEndDate) < new Date(currentStartDate)) {
					isValid = false;
					this.errorMessageForDateValidation = "End Date must be greater than or equal to Start Date.";
					break;
				}
			}
		}
		return isValid;
	}
	//load Application List
	loadApplicationList() {
		this.applicationDetails = this.insertService.getAllApplications();
		this.applicationDetails.subscribe(results => {
			this.applicationList = results;
			this.application.sort((a, b) => (a.applicationName > b.applicationName) ? 1 : ((b.applicationName > a.applicationName) ? -1 : 0));
			this.initializeAutocompleteApplication();
		});
	}

	initializeAutocompleteApplication() {
		this.filteredOptions = this.AdditionalInsertsForm.controls.itemRows['controls'][0].controls["applicationCode"].valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value),
			map(name => name ? this._filter(name) : this.applicationList.slice())
		);
	}
	//Loading customers list.
	loadCustomerList() {
		this.customerList = this.customerservice.getAllCustomers();
		this.customerList.subscribe(results => {
			this.names = results;
			this.customerArray = results;
		});
	}

	//Opening Customer dialog.
	openCustomerDialogInserts() {
		if ((!(this.insertsForm.get('insertsCustomerName').value)) || (!(this.insertsForm.get('insertsCustomerCode').value)) || (this.insertsForm.get('insertsCustomerCode').value == "-1") || (this.insertsForm.get('insertsCustomerName').value == "-1")) {
			this.popupMessageService.openAlertDialog("Please select either Customer Name or Customer Code",this.titleOfInsertPopUp, "check_circle", false);
		}
		else {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.height = "600px";
			dialogConfig.data = {
				custCode: this.insertsForm.get('insertsCustomerCode').value,
				title: "Customer",
				addCustomerDialog: true,
			};
			let dialogRef = this.dialog.open(AddcustomerComponent, dialogConfig);
		}
	}
	deletedInserts = [];
	async deleteRow(index: number) {
		const userresponse = await this.popupMessageService.openConfirmDialog("This action cannot be undone. Are you sure you want to delete this record?", "help_outline", false);
		if (userresponse === "ok") {
			if (this.tempDelInsert[index]) {
				this.deletedInserts.push(this.tempDelInsert[index])
				this.tempDelInsert.splice(index, 1)
			}
			this.isChange("deletedRow")
			if (!this.AdditionalInsertsForm.controls.itemRows['controls'][index].showAddButton && index != 0) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][index - 1].showAddButton = false;
			}
			if (index == 0 && this.AdditionalInsertsForm.value.itemRows.length == 1) {
				this.initializeTheInsertForm();
				this.filteredOptions = this.AdditionalInsertsForm.controls.itemRows['controls'][0].controls["applicationCode"].valueChanges.pipe(
					startWith(''),
					map(value => typeof value === 'string' ? value : value),
					map(name => name ? this._filter(name) : this.applicationList.slice())
				);
				this.setFocus();
			} else {
				if (this.applicationID != "" && this.AdditionalInsertsForm.controls.itemRows['controls'][index].inUpdate) {
					//deelete  call to api
					this.deleteInsertInDB(this.AdditionalInsertsForm.controls.itemRows['controls'][index].insertRecordId, index);
				} else {
					this.formArr.removeAt(index);
				}

			}
		}
	}

	// To delete Insert By ID.	
	async deleteInsertInDB(recId: number, index: any) {
		this.insertService.deleteInsertById(recId).subscribe(result => {
			this.popupMessageService.openAlertDialog(MessageConstants.DELETEMESSAGE,this.titleOfInsertPopUp, "check_circle", false);
			this.ngOnInit();
		}, (error) => {
			this.errorService.handleError(error);
		});

	}

	onFormSubmit() {
		if (this.isChangesExists) {
			let rowNo = this.AdditionalInsertsForm.controls.itemRows['controls'].length - 1;
			let itemrow = this.AdditionalInsertsForm.controls.itemRows['controls'][rowNo];
			this.addNewRow(itemrow, true);
		}//end of is change exist
		else {
			this.popupMessageService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE,this.titleOfInsertPopUp, "check_circle", false)
		}
	}

	performAddOrUpdate() {
		if (this.applicationID != null) {
			/*In Update screen*/
			if (this.isFieldsSame() === false) {
				if (this.checkDates()) {
					if (this.checkIfDatesAboveCurrentDate()) {
						if (this.isReturnChecked()) {
							this.loadUpdateValueData(this.dataOfInserts.length);
						} else {
							this.popupMessageService.openAlertDialog("RTN QTY is required.",this.titleOfInsertPopUp, "check_circle", false);
						}
					} else {
						this.popupMessageService.openAlertDialog(this.errorMessageForDateValidation,this.titleOfInsertPopUp, "check_circle", false);
					}
				} else {
					this.popupMessageService.openAlertDialog(this.errorMessageForDateValidation,this.titleOfInsertPopUp, "check_circle", false);
				}
			}
			else {
				this.popupMessageService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE,this.titleOfInsertPopUp, "check_circle", false)
			}
		}
		/*In add Inserts screen*/
		else {
			if (this.checkDates()) {
				if (this.checkIfDatesAboveCurrentDate()) {
					if (this.isReturnChecked()) {
						this.loadDataToObject(0, this.AdditionalInsertsForm.value.itemRows.length)
					} else {
						this.popupMessageService.openAlertDialog("RTN QTY is required.",this.titleOfInsertPopUp, "check_circle", false);
					}
				} else {
					this.popupMessageService.openAlertDialog(this.errorMessageForDateValidation,this.titleOfInsertPopUp, "check_circle", false);
				}
			} else {
				this.popupMessageService.openAlertDialog(this.errorMessageForDateValidation,this.titleOfInsertPopUp, "check_circle", false);
			}
		}
	}


	checkIfDatesAboveCurrentDate() {
		this.errorMessageForDateValidation = "";
		let n = this.AdditionalInsertsForm.controls.itemRows['controls'].length;
		let isValid = true, start;
		start = 0;

		for (let k = start; k < n; k++) {
			if (this.AdditionalInsertsForm.controls.itemRows['controls'][k].controls["startDateInInserts"].disabled) {
				continue;
			}
			else {
				let currentEndDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("endDateInInserts").value;
				let currentStartDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("startDateInInserts").value;
				currentEndDate = currentEndDate != "" && currentEndDate != null ? currentEndDate : "";
				if (currentStartDate) {
					let date = new Date();
					date.setDate(date.getDate() - 1)
					if (date > new Date(currentStartDate)) {
						isValid = false;
						this.errorMessageForDateValidation = "Start Date must be greater than or equal to Current Date.";
						break;
					}
				}
			}
		}
		return isValid;
	}
	isReturnChecked() {
		let isReturnChecked: boolean = true, itemrow, end = this.AdditionalInsertsForm.controls.itemRows['controls'].length;
		for (let k = 0; k < end - 1; k++) {
			itemrow = this.AdditionalInsertsForm.controls.itemRows['controls'][k];
			let returnValue = itemrow.controls['returnInInserts'].value;
			returnValue = (returnValue === "" || returnValue === null || returnValue === false) ? false : true;
			if (returnValue && (itemrow.controls['returnedQuantity'].value === "" || itemrow.controls['returnedQuantity'].value === null)) {
				isReturnChecked = false;
				break;
			}
		}
		return isReturnChecked;
	}

	loadAllInsertTypes() {
		this.allInsertTypes = this.insertService.getallInsertTypes();
		this.allInsertTypes.subscribe(results => {
			if (!results) { return };
			this.InsertsTypeList = results;
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	loadUpdateValueData(lengthOfDataOfInserts) {
		let tempData: Inserts[] = [];
		for (let m = 0; m < this.tempDelInsert.length; m++) {

			let now = new Date();
			now.setDate(now.getDate() - 1);
			let data, endDate, type, weight, description, active, number, returnInserts, startDate,location;//,total;
			let returnedQuantity, reorderQuantity, receivedQuantity, receivedDate, receivedBy, binLocation, usedQuantity;
			this.AdditionalInsertsForm.controls.itemRows['controls'][m].controls["startDateInInserts"].enable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][m].controls["startDateInInserts1"].enable();
			startDate = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("startDateInInserts").value;
			if (new Date(startDate) < now) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][m].controls["startDateInInserts"].disable();
				this.AdditionalInsertsForm.controls.itemRows['controls'][m].controls["startDateInInserts1"].disable();
			}
			endDate = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("endDateInInserts").value;
			weight = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("weight").value;
			description = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("description").value;
			active = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("insertActiveCheckBox").value;
			returnInserts = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("returnInInserts").value;
			returnedQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("returnedQuantity").value;
			reorderQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("reorderQuantity").value;
			receivedQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("receivedQuantity").value;
			receivedDate = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("receivedDate").value;
			receivedBy = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("receivedBy").value;
			binLocation = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("binLocation").value;
			usedQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("usedQuantity").value;
			location=this.AdditionalInsertsForm.controls.itemRows['controls'][m].get("locationInInserts").value;
			let userLast = JSON.parse(sessionStorage.getItem('currentUser'));
			userLast = userLast.userName;
			data = {
				"recordID": this.dataOfInserts[m].recordID,
				"clientID": this.dataOfInserts[m].clientID,
				"clientName": this.dataOfInserts[m].clientName,
				"clientCode": this.dataOfInserts[m].clientCode,
				"applicationID": this.dataOfInserts[m].applicationID,
				"applicationName": this.dataOfInserts[m].applicationName,
				"applicationCode": this.dataOfInserts[m].applicationCode,
				"startDate": this.datePipe.transform(startDate, "MM/dd/yyyy hh:mm:ss") != null ? this.datePipe.transform(startDate, "MM/dd/yyyy hh:mm:ss") : null,
				"endDate": this.datePipe.transform(endDate, "MM/dd/yyyy hh:mm:ss") != null ? this.datePipe.transform(endDate, "MM/dd/yyyy hh:mm:ss") : null,
				"insertType": this.dataOfInserts[m].insertType,
				"insertTypeName": "",
				"weight": weight === "" ? 0 : weight,
				"code": "",
				"description": description,
				"locationInserts": location,
				"active": (active === true) ? true : false,
				"number": this.dataOfInserts[m].number,
				"returnInserts": (returnInserts === "" || returnInserts === null || returnInserts === false) ? false : true,
				"returnedQuantity": (returnedQuantity === "" || returnedQuantity === null) ? 0 : returnedQuantity,
				"reorderQuantity": (reorderQuantity === "" || reorderQuantity === null) ? 0 : reorderQuantity,
				"receivedQuantity": (receivedQuantity === "" || receivedQuantity === null) ? 0 : receivedQuantity,
				"receivedDate": this.datePipe.transform(receivedDate, "MM/dd/yyyy hh:mm:ss") != null ? this.datePipe.transform(receivedDate, "MM/dd/yyyy hh:mm:ss") : null,
				"receivedBy": receivedBy,
				"binLocation": binLocation,
				"usedQuantity": (usedQuantity === "" || usedQuantity === null) ? 0 : usedQuantity,
				"isDelete": 0,
				"userAdded": this.dataOfInserts[m].userAdded,
				"dateAdded": this.dataOfInserts[m].dateAdded,
				"userLast": userLast,
				"dateLast": new Date()
			}
			tempData.push(data);
		}
		for (let i = 0; i < this.deletedInserts.length; i++) {
			for (let k = 0; k < this.dataOfInserts.length; k++) {
				if (this.deletedInserts[i].recordID === this.dataOfInserts[k].recordID) {
					this.dataOfInserts[k].isDelete = 1;
					tempData.push(this.dataOfInserts[k]);
				}
			}
		}
		this.dataOfInserts = tempData;
		this.loadDataToObject(lengthOfDataOfInserts - this.deletedInserts.length, this.AdditionalInsertsForm.value.itemRows.length);
	}


	//to load data in the controls to object In Inserts and Update
	async loadDataToObject(start, end) {
		//add the data in the current row to dataInserts array
		let now = new Date();
		now.setDate(now.getDate() - 1);
		let usedQuantity;
		if (this.applicationID != null) {

		} else {
			this.dataOfInserts = [];
			this.tempDelInsert = [];
		}
		for (var i = start; i < end; i++) {
			let data, type, weight, number, description, active, location, returnInserts, total, currentClientID;
			let returnedQuantity, reorderQuantity, receivedQuantity, receivedDate, receivedBy, binLocation;
			let currentRowAppID: number, currentrowApplicationCode: string, startDate, endDate;
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].enable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts"].enable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts1"].enable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].enable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["type"].enable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["number"].enable();
			for (let details of this.applicationList) {
				if (((this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("applicationCode").value)["applicationCode"] || this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("applicationCode").value).toLowerCase().trim() === details['applicationCode'].toLowerCase()) {
					currentrowApplicationCode = details['applicationCode']
					currentRowAppID = details['applicationID'];
					currentClientID = details['clientID'];
				}
			}
			if (this.applicationID != null) {
				usedQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("usedQuantity").value;
				usedQuantity = (usedQuantity === "" || usedQuantity === null) ? 0 : usedQuantity;
			} else {
				usedQuantity = 0;
			}
			startDate = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("startDateInInserts1").value;
			endDate = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("endDateInInserts").value;
			type = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("type").value;
			weight = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("weight").value;
			description = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("description").value;
			location = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("locationInInserts").value;
			if (location === "D") {
				location = "D";
			} else {
				location = "W";
			}
			active = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("insertActiveCheckBox").value;
			number = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("number").value;
			returnInserts = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("returnInInserts").value;
			returnedQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("returnedQuantity").value;
			reorderQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("reorderQuantity").value;
			receivedQuantity = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("receivedQuantity").value;
			receivedDate = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("receivedDate1").value;
			receivedBy = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("receivedBy").value;
			binLocation = this.AdditionalInsertsForm.controls.itemRows['controls'][i].get("binLocation").value;
			let userAdded = JSON.parse(sessionStorage.getItem('currentUser'));
			userAdded = userAdded.userName;
			data = {
				"recordID": 0,
				"clientID": currentClientID,
				"clientName": "",
				"clientCode": "",
				"applicationID": currentRowAppID,
				"applicationName": "",
				"applicationCode": currentrowApplicationCode,
				"startDate": this.datePipe.transform(startDate, "MM/dd/yyyy hh:mm:ss"),
				"endDate": this.datePipe.transform(endDate, "MM/dd/yyyy hh:mm:ss") != null ? this.datePipe.transform(endDate, "MM/dd/yyyy hh:mm:ss") : null,
				"insertType": type,
				"insertTypeName": "",
				"weight": (weight === "" || weight === null) ? 0 : weight,
				"code": "",
				"description": description,
				"locationInserts": location,
				"active": (active === "true" || active === true) ? true : false,
				"number": (number === "" || number === null) ? 0 : number,
				"returnInserts": (returnInserts === "" || returnInserts === null || returnInserts === false) ? false : true,
				"returnedQuantity": (returnedQuantity === "" || returnedQuantity === null) ? 0 : returnedQuantity,
				"reorderQuantity": (reorderQuantity === "" || reorderQuantity === null) ? 0 : reorderQuantity,
				"receivedQuantity": (receivedQuantity === "" || receivedQuantity === null) ? 0 : receivedQuantity,
				"receivedDate": this.datePipe.transform(receivedDate, "MM/dd/yyyy hh:mm:ss") != null ? this.datePipe.transform(receivedDate, "MM/dd/yyyy hh:mm:ss") : null,
				"receivedBy": receivedBy,
				"binLocation": binLocation,
				"usedQuantity": usedQuantity,
				"isDelete": 0,
				"userAdded": userAdded,
				"dateAdded": new Date(),
				"userLast": userAdded,
				"dateLast": new Date()
			}
			this.dataOfInserts.push(data);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].disable();
			if (new Date(startDate) < now) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts"].disable();
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts1"].disable();
			}
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["type"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["number"].disable();
		}
		if (this.applicationID != null) {
			this.updateInserts(this.dataOfInserts);
		} else {
			this.createInsert(this.dataOfInserts);
		}
		// //add the data in the current row to dataInserts array end
	}

	//to create inserts data
	async createInsert(dataOfInserts) {
		this.insertService.createInsert(dataOfInserts).subscribe(res => {
			if (res != null) {
				this.isChangesExists = false;
				this.NavigatetoEditInsert(parseInt(res['message']));
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}
	//RESETMESSAGE
	//to update inserts data
	async updateInserts(dataOfInserts) {
		this.insertService.updateInsert(dataOfInserts).subscribe(() => {
			this.popupMessageService.openAlertDialog("Record(s) updated successfully.",this.titleOfInsertPopUp, "check_circle", false);
			this.tempDelInsert = [];
			this.initializeTheInsertForm();
			this.loadInserts(dataOfInserts[0].applicationID, this.startDateFromViewInserts, this.endDateFromViewInserts);

		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	initializeTheInsertForm() {
		this.AdditionalInsertsForm = this._fb.group({
			itemRows: this._fb.array([this.initItemRows()])
		});

	}

	async NavigatetoEditInsert(id: number) {
		await this.popupMessageService.openOkAlertDialog("Record(s) saved successfully.",this.titleOfInsertPopUp, "check_circle", false);
		this.router.navigate(['./view_insert']);
	}

	//to check if all fields are same
	isFieldsSame() {
		let isFieldsSame: boolean = true, breakCondition: boolean;
		if (this.lengthofInsertsBeforeAdding != this.AdditionalInsertsForm.controls.itemRows['controls'].length) {
			isFieldsSame = false;
		} else {
			let now = new Date();
			now.setDate(now.getDate() - 1);
			for (let k = 0; k < this.insertDataToCompare.length; k++) {
				for (let data = 0; data < this.insertDataToCompare.length; data++) {
					if (k === data) {
						let endDateData = this.datePipe.transform(this.insertDataToCompare[data].endDate, "MM/dd/yy");
						endDateData = endDateData != null && endDateData != "" ? endDateData : null
						let recvdDate = this.datePipe.transform(this.insertDataToCompare[data].receivedDate, "MM/dd/yy");
						recvdDate = recvdDate != null && recvdDate != "" ? recvdDate : null
						let startDateData = this.datePipe.transform(this.insertDataToCompare[data].startDate, "MM/dd/yy");
						startDateData = startDateData != null && startDateData != "" ? startDateData : null;

						let formRetrnInsertValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get("returnInInserts").value;
						let formRetrnQtyValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('returnedQuantity').value;
						let formNumberValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('number').value;
						let formWeightValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('weight').value;
						let formReodrQtyValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('reorderQuantity').value;
						let formRecvdQtyValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('receivedQuantity').value;
						let formUsedQtyValue = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('usedQuantity').value;
						let formEndDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('endDateInInserts').value;
						formEndDate = (formEndDate != null && formEndDate != "") ? formEndDate : null

						let formStartDate;
						if (new Date(this.insertDataToCompare[data].startDate) < now) {
							this.AdditionalInsertsForm.controls.itemRows['controls'][k].controls["startDateInInserts"].enable();
							this.AdditionalInsertsForm.controls.itemRows['controls'][k].controls["startDateInInserts1"].enable();
							formStartDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('startDateInInserts').value;
							this.AdditionalInsertsForm.controls.itemRows['controls'][k].controls["startDateInInserts"].disable();
							this.AdditionalInsertsForm.controls.itemRows['controls'][k].controls["startDateInInserts1"].disable();
						} else {
							formStartDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('startDateInInserts').value;
						}
						formStartDate = (formStartDate != null && formStartDate != "") ? formStartDate : null

						let formRecvdDate = this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('receivedDate').value;
						formRecvdDate = (formRecvdDate != null && formRecvdDate != "") ? formRecvdDate : null
						formRetrnInsertValue = (formRetrnInsertValue === "" || formRetrnInsertValue === null || formRetrnInsertValue === false) ? false : true;
						if (!formRetrnInsertValue) {
							formRetrnQtyValue = 0;
						} else {
							formRetrnQtyValue = (formRetrnQtyValue == null || formRetrnQtyValue == "") ? 0 : formRetrnQtyValue
						}
						formNumberValue = (formNumberValue == null || formNumberValue == "") ? 0 : formNumberValue
						formWeightValue = (formWeightValue == null || formWeightValue == "") ? 0 : formWeightValue
						formReodrQtyValue = (formReodrQtyValue == null || formReodrQtyValue == "") ? 0 : formReodrQtyValue
						formRecvdQtyValue = (formRecvdQtyValue == null || formRecvdQtyValue == "") ? 0 : formRecvdQtyValue
						if (endDateData != formEndDate
							|| startDateData != formStartDate
							|| recvdDate != formRecvdDate
							|| formRetrnQtyValue != this.insertDataToCompare[data].returnedQuantity
							|| this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('type').value != this.insertDataToCompare[data].insertType
							|| formRetrnInsertValue != this.insertDataToCompare[data].returnInserts
							|| formNumberValue != this.insertDataToCompare[data].number
							|| formUsedQtyValue != this.insertDataToCompare[data].usedQuantity
							|| formWeightValue != this.insertDataToCompare[data].weight
							|| formReodrQtyValue != this.insertDataToCompare[data].reorderQuantity
							|| formRecvdQtyValue != this.insertDataToCompare[data].receivedQuantity
							|| this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('description').value != this.insertDataToCompare[data].description
							|| this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('binLocation').value != this.insertDataToCompare[data].binLocation
							|| this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('receivedBy').value != this.insertDataToCompare[data].receivedBy
							|| this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('insertActiveCheckBox').value != this.insertDataToCompare[data].active
							|| this.AdditionalInsertsForm.controls.itemRows['controls'][k].get('locationInInserts').value != this.insertDataToCompare[data].locationInserts
						) {
							isFieldsSame = false;
							breakCondition = true;
							break;
						}
					}
				}
				if (breakCondition) {
					break;
				}
			}
		}
		return isFieldsSame;
	}
	// dynamic row end
	dialogCancel() {
		this.dialogRef.close("cancel");
	}

	dialogOK() {
		this.dialogRef.close("ok");
	}
	clearCharges() {
		this.insertsForm.controls['description'].setValue('');
	}

	//Change of customer name reflect in customer code and vice versa
	isChangeInCustomer(event) {
		for (let name of this.names) {
			if (name.customerCode === event.source.value) {
				this.insertsForm.controls['insertsCustomerName'].setValue(name.customerCode.toString());
				this.insertsForm.controls['insertsCustomerCode'].setValue(name.customerCode.toString());
			}
			else if (event.source.value === -1) {
				this.insertsForm.controls['insertsCustomerName'].setValue(-1);
				this.insertsForm.controls['insertsCustomerCode'].setValue(-1);
			}
		}
	}

	setLocation(event) {
		let n = this.AdditionalInsertsForm.controls.itemRows['controls'].length;
		this.location1 = "D";
		for (let details of this.applicationList) {
			if (event.source.value['applicationCode'] === details['applicationCode']) {
				if (details['printLocation'] === 'W') {
					this.location1 = "W"
					break
				}
			}
		}
		if (event.value == -1) {
			this.location1 = "";
		}
		if (event.value != -1) {
			//this.AdditionalInsertsForm.controls.itemRows['controls'][n - 1].controls["locationInInserts"].disable();
		} else {
			this.AdditionalInsertsForm.controls.itemRows['controls'][n - 1].controls["locationInInserts"].enable();
		}
		if (this.location1 === "D")
			this.AdditionalInsertsForm.controls.itemRows['controls'][n - 1].controls["locationInInserts"].setValue("D");
		else {
			this.AdditionalInsertsForm.controls.itemRows['controls'][n - 1].controls["locationInInserts"].setValue("W");
		}
	}

	setFocus() {
		setTimeout(() => {
			if (this.applicationID == null) {
				this.rows.last.nativeElement.focus();
			}

		}, 500);
	}

	setFocusToReturnQty() {
		setTimeout(() => {
			this.returnQty.last.nativeElement.focus();
		}, 500);
	}

	setFocusInEditInserts() {
		setTimeout(() => {
			this.endDate.first.nativeElement.focus();
		}, 500);
	}

	async resetForm() {
		if (this.applicationID != null) {
			/*Update reset condition*/
			if (this.isFieldsSame() === false) {
				let resetConfirmation = await this.popupMessageService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (resetConfirmation === "ok") {
					this.initializeTheInsertForm();
					this.firstTimeInUpdate = true;
					this.loadAllControls(this.insertDataToCompare);
				}
			}
		} else {
			/*Insert Reset Condition*/
			if (this.isChangesExists) {
				let resetConfirmation = await this.popupMessageService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (resetConfirmation === "ok") {
					this.isChangesExists = false;
					this.initializeTheInsertForm();
					let i = this.AdditionalInsertsForm.value.itemRows.length;
					i = i - 1;
					this.filteredOptions = this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].valueChanges.pipe(
						startWith(''),
						map(value => typeof value === 'string' ? value : value),
						map(name => name ? this._filter(name) : this.applicationList.slice())
					);
					this.setFocus();
				}
			} else {
				this.AdditionalInsertsForm.markAsUntouched();
				this.initializeTheInsertForm();
				this.initializeAutocompleteApplication();
				this.setFocus();
			}
		}
	}

	loadInserts(applicationID, startDate, endDate) {
		this.isUpdate = true;
		this.isChangesExists = false;
		this.showUsedQuantity = true;
		this.dataOfInserts = [];
		this.insertDataToCompare = [];
		this.lengthofInsertsBeforeAdding = 0;
		this.allInserts = this.insertService.getallInsertsByApplicationID(applicationID, startDate, endDate);
		this.allInserts.subscribe(results => {
			if (!results) { return };
			this.lengthofInsertsBeforeAdding = results.length;
			this.insertDataToCompare = results;
			this.dataOfInserts = results;
			for (let r = 0; r < results.length; r++) {
				this.tempDelInsert.push({
					"recordID": this.dataOfInserts[r].recordID
				});
			}
			// this.tempDelInsert=results;
			this.insertsForm.controls['insertsCustomerName'].setValue(results[0].clientName);
			this.insertsForm.controls['insertsCustomerCode'].setValue(results[0].clientCode);
			this.insertsForm.controls['insertsApplicationName'].setValue(results[0].applicationName);
			this.applicationCodeValue = results[0].applicationCode;
			if (results[0].locationInserts === "W") {
				this.locationValue = 'W';
			} else {
				this.locationValue = 'D';
			}
			this.insertsForm.controls['insertsApplicationCode'].setValue(results[0].applicationCode);
			this.insertsForm.controls['insertsCustomerName'].disable();
			this.insertsForm.controls['insertsCustomerCode'].disable();
			this.insertsForm.controls['insertsApplicationName'].disable();
			this.insertsForm.controls['insertsApplicationCode'].disable();
			this.loadAllControls(results);
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}
	loadAllControls(insertResults) {
		let now = new Date();
		this.deletedInserts = [];
		this.firstTimeInUpdate = true;
		now.setDate(now.getDate() - 1);
		for (let i = 0; i < insertResults.length; i++) {
			if (i != insertResults.length - 1) {
				this.formArr.push(this.initItemRows());
			}
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].setValue({ applicationCode: insertResults[i].applicationCode });
			//for tb app.code
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode1"].setValue(insertResults[i].applicationCode);
			let receivedDate = this.datePipe.transform(insertResults[i].receivedDate, "MM/dd/yy");
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts"].setValue(insertResults[i].startDate);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts1"].setValue(new Date(insertResults[i].startDate));
			if (insertResults[i].endDate != "" && insertResults[i].endDate != null) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["endDateInInserts"].setValue(insertResults[i].endDate);
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["endDateInInserts1"].setValue(new Date(insertResults[i].endDate));
			}
			if (insertResults[i].receivedDate != "" && insertResults[i].receivedDate != null) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["receivedDate"].setValue(receivedDate);
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["receivedDate1"].setValue(new Date(receivedDate));
			}
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["number"].setValue(insertResults[i].number);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["description"].setValue(insertResults[i].description);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["weight"].setValue(insertResults[i].weight);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["returnInInserts"].setValue(insertResults[i].returnInserts);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["insertActiveCheckBox"].setValue(insertResults[i].active);
			
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["type"].setValue(insertResults[i].insertType);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["reorderQuantity"].setValue(insertResults[i].reorderQuantity);
			//set focus to record if this is application clicked in view Insert
			if (this.selectedApplicationInsertType === (insertResults[i].insertTypeName + insertResults[i].number.toString())) {
				//this.endDate.last.nativeElement.focus(); 
			}
			//if return inserts is checked
			if (insertResults[i].returnInserts) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["returnedQuantity"].enable();
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["returnedQuantity"].setValue(insertResults[i].returnedQuantity);
			}
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].inUpdate = true;
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].insertRecordId = insertResults[i].recordID;
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["receivedQuantity"].setValue(insertResults[i].receivedQuantity);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["usedQuantity"].setValue(insertResults[i].usedQuantity);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["receivedBy"].setValue(insertResults[i].receivedBy);
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["binLocation"].setValue(insertResults[i].binLocation);
			//if (insertResults[i].locationInserts === "W") {
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].setValue(insertResults[i].locationInserts);
			// } else {
			// 	this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].setValue('D');
			// }
			if (i < insertResults.length) {
				if (new Date(insertResults[i].startDate) >= now) {
					this.AdditionalInsertsForm.controls.itemRows['controls'][i].showDeleteButton = true;
				}
				if (i != insertResults.length - 1) {
					this.AdditionalInsertsForm.controls.itemRows['controls'][i].showAddButton = true;
				}
			}
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode"].disable();
			//for tb app.code
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["applicationCode1"].disable();
			if (new Date(insertResults[i].startDate) < now) {
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts"].disable();
				this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["startDateInInserts1"].disable();
			}
		//	this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["locationInInserts"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["type"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][i].controls["number"].disable();
			if(insertResults[i].active==false){
				this.disableInactiveRow(i);
			}
		}
	}
		//disable inactive rows
		disableInactiveRow(rowNumber){
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["startDateInInserts"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["startDateInInserts1"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["type"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["number"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["applicationCode1"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["applicationCode"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["binLocation"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["receivedBy"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["usedQuantity"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["receivedQuantity"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["type"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["returnedQuantity"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["reorderQuantity"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["insertActiveCheckBox"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["returnInInserts"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["weight"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["description"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["startDateInInserts"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["startDateInInserts1"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["endDateInInserts"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["endDateInInserts1"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["receivedDate"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["receivedDate1"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["returnedQuantity"].disable();
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].showDeleteButton = false;
			this.AdditionalInsertsForm.controls.itemRows['controls'][rowNumber].controls["locationInInserts"].disable();
		}


	//for getting scroll to bottom.
	scrollToDown() {
		var elmnt = document.getElementById("scrollToDown");
		elmnt.scrollIntoView({ behavior: "smooth" });
	}

	addEvent(event, row, controlName1, controlName2) {
		var todaysDate = new Date(row.controls[controlName2].value);
		let currentMonth = todaysDate.getMonth() + 1;
		let currentDay = todaysDate.getDate();
		let currentYear = todaysDate.getFullYear();
		let curMonthInString, curDayInString, curYearInString;
		curYearInString = String(currentYear);
		curYearInString.slice(2)
		if (String(currentMonth).length == 1) {
			curMonthInString = "0" + String(currentMonth);
		} else {
			curMonthInString = String(currentMonth);
		}
		if (String(currentDay).length == 1) {
			curDayInString = "0" + String(currentDay);
		} else {
			curDayInString = String(currentDay);
		}
		let currentDate = curMonthInString + "/" + curDayInString + "/" + curYearInString.slice(2);
		row.controls[controlName1].setValue(currentDate);
		this.isChange(controlName2);
	}

	inValidDate: boolean;
	checkError(controlName1, controlName2, row) {
		let dateToSet: any = new Date(row.controls[controlName1].value);
		let now = new Date();
		now.setDate(now.getDate() - 1);
		if (dateToSet == "Invalid Date" && row.controls[controlName1].value != null && row.controls[controlName1].value != "") {
			this.inValidDate = !this.inValidDate;
		}
		else {
			if (row.controls[controlName1].value != null && row.controls[controlName1].value != "") {
				if (new Date(dateToSet) >= now && controlName1 != 'receivedDate') {
					row.controls[controlName2].setValue(dateToSet);
				 } 
				else if(controlName1 == 'receivedDate'){
					row.controls[controlName2].setValue(dateToSet);
				}
			}
		}
		this.isChange(controlName1)
	}
	public hasError = (controlName: string, itemrow, errorName: string) => {
		return itemrow.controls[controlName].hasError(errorName);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 if(localStorage.getItem("backButtonClicked")=='clicked'){
		 return true;
	 }
	  return this.isFieldsSame() ||!this.isChangesExists;
	}
}

