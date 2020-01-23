import { Component, OnInit, ViewChild, QueryList, ElementRef } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormControl, FormBuilder, FormArray, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';

import { Observable, empty,BehaviorSubject, Subject } from 'rxjs';
import { PopupMessageService } from '@/shared/popup-message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';

import { AdditionalchargesService } from '@/businessservices/additionalcharges/additionalcharges.service';


import { Customer } from '@/businessclasses/Customer/customer';
import { Application } from '@/businessclasses/Application/Application';
import { CustomerService } from '@/businessservices/customer/customer.service';
import { ApplicationService } from '@/businessservices/application/application.service';

import { Feedescription } from '@/businessclasses/admin/feedescription';
import { FeedescriptionService } from '@/businessservices/admin/feedescription.service';

import { MessageConstants } from '@/shared/message-constants';
import { AuthenticationService } from '@/_services';
import { ErrorHandlerService } from '@/shared/error-handler.service';

import { DecimalPipe, DatePipe } from '@angular/common';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ChargeType } from '@/businessclasses/Application/charge-type';
import { UserPrivilegesService } from '@/_services/userprivilege.service';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
import { ComponentCanDeactivate } from '../../../_guards/can-deactivate.guard';
@Component({
	selector: 'app-additional-charges',
	templateUrl: './additional-charges.component.html',
	styleUrls: ['./additional-charges.component.css']
})
export class AdditionalChargesComponent implements OnInit {

	maxDate = new Date();//To disable future dates in Mat-Datepicker.
	public additionalChargesForm: FormGroup;
	applicationList: Observable<Application[]>;
	customerList: Observable<Customer[]>;
	customerNames: Customer[] = [];
	names: Application[] = [];
	applicationArray = [];
	filteredOptionsApplication: Observable<Application[]>;
	filteredOptionsApplicationCode: Observable<Application[]>;

	allFeeDescription: Observable<Feedescription[]>;
	filteredOptionsChargeTypes: Observable<Feedescription[]>;
	filteredOptionsCustomer: Observable<Customer[]>;
	feeDescription = [];
	tabIndex: number = 0;
	isUpdate = false;
	isSearchVisible: boolean = true;
	datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	checkDate: boolean;
	insertid: any;
	hasScreenInsertPrivilege = false;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	disableForm: boolean = false;
	jobRecordId : number;

	@ViewChildren('focusElement') focusedElement: QueryList<any>;
	@ViewChildren('focusElementCode') focusElementCode: QueryList<any>;
	@ViewChildren('jobNameForFocus') jobNameForFocus : QueryList<any>;
	@ViewChildren('amountToFocus') amountToFocus :  QueryList<any>;
	public customerMatched:boolean=false;
	inValidAmountFlag:boolean=false;
	jobDetailRunDate :any;
	application: Application[] = [];
	constructor(private _fb: FormBuilder,
		private popupService: PopupMessageService,
		private popupMessageService: PopupMessageService,
		private customerservice: CustomerService,
		private applicationservice: ApplicationService,
		private route: ActivatedRoute,
		private AdditionalchargesService: AdditionalchargesService,
		private authenticationService: AuthenticationService,
		private feeDescriptionService: FeedescriptionService,
		private errorService: ErrorHandlerService,
		private dp: DecimalPipe,
		public dtp: DatePipe,
		private userPrivilegesService: UserPrivilegesService,
	) { }


	ngOnInit() {
		//check user session
		this.errorService.IsValidUserSession();

		//	this.insertid = this.route.snapshot.paramMap.get('id');
		this.AdditionalChargesFormInit();
		this.loadAllFeeDescriptions();
		this.loadApplicationList();
		this.loadCustomerList();

		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.additionalChargesScreenName)) {
			this.hasScreenInsertPrivilege = true;
		}
	}
	public ngAfterContentInit() {
		this.setFocus('customerName');
	}

	//set focus on elements
	setFocus(controlName) {
		setTimeout(() => {
			if(controlName == 'customerName'){
				this.focusedElement.last.nativeElement.focus();
			}
			else{
				this.focusElementCode.last.nativeElement.focus();
			}
			
		}, 500);
	}

	setFocusOnSelect(controlName) {
		setTimeout(() => {
			if(controlName == 'customer'){
				this.jobNameForFocus.last.nativeElement.focus();
			}
			else if(controlName == 'chargeType'){
				this.amountToFocus.last.nativeElement.focus();
			}	
		}, 0);
	}


	//filter for amount
	changeToAmountFormat(ctrl, itemrow) {
		let ctrlVal = +(itemrow.controls[ctrl].value.replace(/,/g, ''));
		if (itemrow.controls[ctrl].value != null && itemrow.controls[ctrl].value != "" && ctrlVal > 0) {
			let amountData = itemrow.controls[ctrl].value.replace(/,/g, '');//.replace(",","");
			let formatedAmount = this.dp.transform(amountData, '1.3-3');
			itemrow.controls[ctrl].setValue(formatedAmount);
		}
		else {
			this.inValidAmountFlag = true;
			if(itemrow.controls[ctrl].value != null && itemrow.controls[ctrl].value != ""){
				itemrow.controls['amount'].setErrors({'incorrect': true});	
			}
	
		}

	}

	//validate spaces 
	validateSpaces(key) {
		key.srcElement.value = key.srcElement.value.trim();
	}

	restrictSpecialCharacters(key){
		var keycode = (key.which) ? key.which : key.keyCode;
		if(keycode==32 || (keycode>=48 && keycode<=57) || (keycode>=65 && keycode<=90) || (keycode>=92 && keycode<=122) ){
			return true;
		}
		return false;
	}

	//validate desc 
	validateDescription(key) {
		var keycode = (key.which) ? key.which : key.keyCode;
		let inputData: string = key.srcElement.value;
		if (inputData.length < 100)
			return true;
		else
			return false;
	}

	//key press event for amount.
	validateDecimals(key) {
		var keycode = (key.which) ? key.which : key.keyCode;
		let inputData : string = key.srcElement.value;
		let inputData1 = 0;
		if(inputData == '.'){
			inputData1 = 1;
		}
		else{
			inputData1 = +inputData;
		}
		
		if(inputData!= "" && inputData!=null  && inputData1>0){
			if (inputData.replace(/,/g, '').length < 10) {
				if (inputData.replace(/,/g, '').length == 6 && inputData.indexOf('.') == -1) {
					if (keycode == 46) {	
						return true;
					}
					else {
						return false;
					}
				}
				else {
					if ((keycode == 46 && inputData.indexOf('.') == -1)) {
						return true;
					}
					else if (keycode < 48 || keycode > 57) {
						return false;
					}
				}
			}
			else {
				return false;
			}
		}
		else{
			if(inputData=='' || inputData1==0){
				if(key.which==48){
					return false;
				}
				else {
					if ((keycode == 46 && inputData.indexOf('.') == -1)) {
						return true;
					}
					else if (keycode < 48 || keycode > 57) {
						return false;
					}
				}
			}
		}
		
	}


	AdditionalChargesFormInit() {
		this.additionalChargesForm = this._fb.group({
			itemRows: this._fb.array([this.initItemRows()])
		});
	}

	// dynamic row push into additional charge form
	get formArr() {
		return this.additionalChargesForm.get('itemRows') as FormArray;
	}

	//initilize the additional charge form
	initItemRows() {
		return this._fb.group({
			applicationName: ['', [Validators.required]], //Validators.required
			applicationCode: ['', [Validators.required]],
			runDate: ['', [Validators.required, Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			runDateWithPicker: [''],
			jobName: ['', [Validators.minLength(5)]], //,SpaceValidator.ValidateSpaces
			chargeType: ['', [Validators.required]],
			amount: ['', [Validators.required]],
			description: ['', [Validators.maxLength(100)]],
			jobRecordId : 0,
			jobDetailRunDate : null,
			showAddButton: false,
			showDeleteButton: false,
		});
	}



	//date validations
	inValidDate: boolean;
	setDateInDatePicker(controlName1, controlName2, row) {
		let dateToSet: any = new Date(row.controls[controlName1].value);
		if (dateToSet >= this.maxDate) {
			//row.controls[controlName1].setErrors({'incorrectDate': true});	
		}
		if (dateToSet == "Invalid Date" && row.controls[controlName1].value != null && row.controls[controlName1].value != "") {
			this.inValidDate = !this.inValidDate;
			row.controls[controlName2].setValue("");
		}
		else {
			row.controls[controlName2].setValue(dateToSet);
		}
	}

	checkForRunDateDate(row,ctrlName){
		if (new Date(row.controls[ctrlName].value) >= this.maxDate) {
			row.controls['runDate'].setErrors({'incorrectDate': true});	
		}
		else if((row.controls[ctrlName].value !== null && row.controls[ctrlName].value !=='' && new Date(row.controls[ctrlName].value) <= this.maxDate)){   
			var todaysDate = new Date(row.controls['runDateWithPicker'].value);
			let currentDate = this.dtp.transform(todaysDate, 'MM/dd/yy').toString();
			row.controls[ctrlName].setValue(this.dtp.transform(new Date(currentDate), 'MM/dd/yy').toString());
			row.controls['runDateWithPicker'].setValue(new Date(currentDate));		 
			if(new Date(row.controls[ctrlName].value) < new Date()){
				return false;
			}
		return true;    
		}
	}

	//check object or string of chargetype and get chargetype value 
	getChargeType(i: number) {
		this.additionalChargesForm.controls.itemRows['controls'][i].controls["chargeType"].enable();
		let iFeeDes = typeof this.additionalChargesForm.value.itemRows[i].chargeType;
		if (iFeeDes === "string") {
			iFeeDes = this.additionalChargesForm.value.itemRows[i].chargeType;
		}
		else {
			iFeeDes = this.additionalChargesForm.value.itemRows[i].chargeType.description;
		}
		return iFeeDes;
	}
	getClientCode(index: number) {
		this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationCode"].enable();
		let typeOfCode = typeof (this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationCode"].value);
		//check type of customer code
		let cCode = "";
		if (typeOfCode == "object") {
			cCode = this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationCode"].value['applicationCode'];
		} else {
			cCode = this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationCode"].value;
		}
		return cCode
	}
	getClientName(index: number) {
		this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationName"].enable();
		let typeOfName = typeof (this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationName"].value);
		//check type of customer name
		let cName = "";
		if (typeOfName == "object") {
			cName = this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationName"].value['customerName'];
		} else {
			cName = this.additionalChargesForm.controls.itemRows['controls'][index].controls["applicationName"].value;
		}
		return cName;
	}

	//enable the row by inxed
	enableRowByIndex(i) {
		this.additionalChargesForm.controls.itemRows['controls'][i].controls["applicationName"].enable();
		this.additionalChargesForm.controls.itemRows['controls'][i].controls["applicationCode"].enable();
		this.additionalChargesForm.controls.itemRows['controls'][i].controls["jobName"].enable();
		this.additionalChargesForm.controls.itemRows['controls'][i].controls["chargeType"].enable();
	}

	//implemented in future 
	async checkThisCombinationExistOrNot(currentIndex: number) {
		let isDuplicateExists = true;
		let icCode, icName, jcCode, jcName, iFeeDes, jFeeDes;
		if (this.additionalChargesForm.value.itemRows.length > 1){
			for (let i = 0; i < this.additionalChargesForm.value.itemRows.length; i++) {
				 this.enableRowByIndex(i);
				iFeeDes =  this.getChargeType(i).toLowerCase();
				icCode =  this.getClientCode(i).toLowerCase();
				icName =  this.getClientName(i).toLowerCase();
				for (let j = 0; j < this.additionalChargesForm.value.itemRows.length; j++) {
					 this.enableRowByIndex(j);
					jFeeDes = this.getChargeType(j).toLowerCase();
					jcCode =  this.getClientCode(j).toLowerCase();
					jcName = this.getClientName(j).toLowerCase();
					if (i!= j) {
						if (this.additionalChargesForm.value.itemRows[i].applicationName != "" || this.additionalChargesForm.value.itemRows[i].applicationCode != ""
							|| this.additionalChargesForm.value.itemRows[i].chargeType != "" || jFeeDes.trim().length!= 0 || this.additionalChargesForm.value.itemRows[i].amount != null
							|| this.additionalChargesForm.value.itemRows[i].amount != "" || this.additionalChargesForm.value.itemRows[i].runDate != "") {								
							if (icCode === jcCode && icName === jcName &&
								this.additionalChargesForm.value.itemRows[i].jobName.toLowerCase() === this.additionalChargesForm.value.itemRows[j].jobName.toLowerCase() &&
								iFeeDes.trim() === jFeeDes.trim() &&
								this.additionalChargesForm.value.itemRows[i].amount === this.additionalChargesForm.value.itemRows[j].amount &&
								this.additionalChargesForm.value.itemRows[i].runDate === this.additionalChargesForm.value.itemRows[j].runDate) {
								isDuplicateExists = false;
								break;
							}
						}						
					}
				}
				if(isDuplicateExists==false){
					break;
				}
			}
			if(isDuplicateExists){				
				isDuplicateExists = await this.duplicateRecordExistsInDB(currentIndex);							
			}			
		}
		else{
			if(isDuplicateExists){					
				isDuplicateExists = await this.duplicateRecordExistsInDB(currentIndex);						
			}
		}			
		return isDuplicateExists;	
	 }

	async duplicateRecordExistsInDB(currentIndex:number){
		let isDuplicateExists = true;
		if (this.additionalChargesForm.value.itemRows[currentIndex-1].applicationName != "" && this.additionalChargesForm.value.itemRows[currentIndex-1].applicationCode != ""
			&& this.additionalChargesForm.value.itemRows[currentIndex-1].chargeType != "" && this.getChargeType(currentIndex-1).length!= 0 && this.additionalChargesForm.value.itemRows[currentIndex-1].amount != null
			&& this.additionalChargesForm.value.itemRows[currentIndex-1].amount != "" && this.additionalChargesForm.value.itemRows[currentIndex-1].runDate != "") 								
		{
			var setDate = new Date(this.additionalChargesForm.value.itemRows[currentIndex-1].runDate);
			let currentDate = this.dtp.transform(setDate, 'MM/dd/yy').toString();
				let dateArray = currentDate.split("/");
				let selectedDate = dateArray[0] + "-" + dateArray[1] + "-20" + dateArray[2]; //MMddYYYY
				let temp ={
					id:0,
					runDate: selectedDate ,
					jobName : this.additionalChargesForm.value.itemRows[currentIndex-1].jobName,
					feeDesc : this.getChargeType(currentIndex-1),
					amount : this.additionalChargesForm.value.itemRows[currentIndex-1].amount,
				description : this.additionalChargesForm.value.itemRows[currentIndex-1].description,
				jobDetailRunDate :this.jobDetailRunDate === null || this.jobDetailRunDate === undefined ? selectedDate:this.jobDetailRunDate,
				jobRecordId  : this.jobRecordId
			};

			if (temp.runDate != "" && temp.jobName != "" && temp.feeDesc!= null && temp.amount != null && temp.jobDetailRunDate != "") 								
			{
				var promise = await new Promise((resolve, reject) => {
					this.AdditionalchargesService.checkDuplicateData(temp).subscribe( results =>{
						if(!results){return};
						if(results.message == "RECORD_IN_USE"){
							isDuplicateExists = false;			
						}
						resolve();
					},
					(error)=>{
						this.errorService.handleError(error);
						reject();
					});
			
				});	
			}
		}
		return isDuplicateExists;
	}
	

	// get selected charge type text from dropdown
	setSelectedFeeDesc(feeId) {
		let feeDesc = typeof (feeId)
		if (feeId) {
			let ind = this.feeDescription.findIndex(item => item.recId === feeId);
			feeDesc = this.feeDescription[ind].description;
		}
		return feeDesc;
	}

	//clear customer name and code when customer code is empty and vice versa
	validateApplication(eventObj, rowItem, formControlName, indexRow) {
		if (eventObj.srcElement.value === "" && this.names == this.applicationArray) {
			rowItem.controls["applicationCode"].setValue("");
			rowItem.controls["applicationName"].setValue("");
		}
		else {
			this.isChangeInApplication(eventObj, rowItem, formControlName, indexRow, false);
		}
	}
	validateCustomer(eventObj, rowItem, formControlName, indexRow){
		this.names = this.applicationArray; 
		this.initializeAutocompleteApplication(indexRow);

		if (eventObj.srcElement.value === "") {
			rowItem.controls["applicationName"].setValue("");
		}
		else {
			this.isChangeInCustomer(eventObj, rowItem, formControlName, indexRow, false);
		}
	}

	//generate job number when job number is not given: Customer Code +(0)+ Month + Day + AC 
	generateJobNumber(custCode) {
		let str = "";
		if (custCode.length <= 3) {
			custCode += "0";
		}
		let monthArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
		let d = new Date();
		let month = d.getMonth();
		let day = d.getDate();
		str += custCode + monthArray[month] + day + "AC"
		return str;
	}

	//add new row event , when click on plus icon  
	async addNewRow(itemrow) {
		this.jobRecordId = 0;
		let flag = 0;
		let genJobNumber;
		this.disableForm = true;
		let isDuplicateExists:boolean;
		for (var i = 0; i < this.additionalChargesForm.value.itemRows.length; i++) {
			this.additionalChargesForm.controls.itemRows['controls'][i].controls["applicationName"].enable();
			this.additionalChargesForm.controls.itemRows['controls'][i].controls["applicationCode"].enable();
			this.additionalChargesForm.controls.itemRows['controls'][i].controls["jobName"].enable();
			this.additionalChargesForm.controls.itemRows['controls'][i].controls["chargeType"].enable();
			let feeDes = typeof this.additionalChargesForm.value.itemRows[i].chargeType;
			if (feeDes === "string") {
				feeDes = this.additionalChargesForm.value.itemRows[i].chargeType;
			}
			else {
				feeDes = this.additionalChargesForm.value.itemRows[i].chargeType.description;
			}

			if (this.additionalChargesForm.value.itemRows[i].applicationName === "" || this.additionalChargesForm.value.itemRows[i].applicationCode === ""
				|| this.additionalChargesForm.value.itemRows[i].chargeType === "" || feeDes.trim().length === 0 || this.additionalChargesForm.value.itemRows[i].amount === null
				|| this.additionalChargesForm.value.itemRows[i].amount === "" || this.additionalChargesForm.value.itemRows[i].runDate === "") {
				flag++;
			}
		}
		if (flag === 0) {
			if (this.isCustomerValid(itemrow)) {
				// generate the job number
				let typeOfCustCode = typeof itemrow.controls["applicationCode"].value;
				let applicationCode = typeOfCustCode == 'object' ?itemrow.controls["applicationCode"].value.applicationCode :itemrow.controls["applicationCode"].value;
				if (typeOfCustCode == 'object') {
					genJobNumber = this.generateJobNumber(itemrow.controls["applicationCode"].value.applicationCode);
				} else {
					genJobNumber = this.generateJobNumber(itemrow.controls["applicationCode"].value);
				}

				if (!itemrow.controls["jobName"].value.trim() || itemrow.controls["jobName"].value.trim() == "") {
					itemrow.controls['jobName'].setValue(genJobNumber);
					itemrow.controls["jobDetailRunDate"].setValue(itemrow.controls.runDate.value);
					isDuplicateExists = await this.checkThisCombinationExistOrNot(i)
					if (isDuplicateExists) {
						this.disableAndCreateNewRow(itemrow, i);
					}
					else {
						this.disableRowsWhenInvalidData();
						this.popupService.openAlertDialog("Duplicate record(s) not allowed.", "Additional Charges", "check_circle", false);
					}
				}
				else {
					let jobNumberData = itemrow.controls["jobName"].value;
					if (!(jobNumberData.toLowerCase().endsWith("ac"))) {	

						this.AdditionalchargesService.validateJobNumber(jobNumberData, applicationCode).subscribe(results => {
							//if (!results) { return };
							let JobData = results[0];
							if (JobData == null) {
								itemrow.controls['jobName'].setErrors({'inValid': true});	
								this.popupService.openAlertDialog("Invalid Job Name.", "Additional Charges", "check_circle", false);
							}
							else {
								this.checkProcessedFlag(itemrow,JobData,i);
								/* in this else code write on above function */								
							}
						},
						(error) => {
							this.errorService.handleError(error);
						});

					}else {
						itemrow.controls["jobDetailRunDate"].setValue(itemrow.controls.runDate.value);
						if(this.checkJobNameFormat(applicationCode,jobNumberData)){
							isDuplicateExists = await this.checkThisCombinationExistOrNot(i)
							if (isDuplicateExists) {
								this.disableAndCreateNewRow(itemrow, i);
							}else{
								this.disableRowsWhenInvalidData();
								this.popupService.openAlertDialog("Duplicate record(s) not allowed.", "Additional Charges", "check_circle", false);
							}
						}else{
							this.disableRowsWhenInvalidData();
							this.popupService.openAlertDialog("Invalid Job Name Format.", "Additional Charges", "check_circle", false);
						}
					}
				}
			}
			else {
				this.popupMessageService.openAlertDialog("Invalid Customer Name or Customer Code.", "Additional Charges", "check_circle", false);
			}
		}else {
			this.disableRowsWhenInvalidData();
			this.popupMessageService.openAlertDialog("Customer Name, Customer Code, Charge Type, Amount and Date fields are required.", "Additional Charges", "check_circle", true);
		}
		
		if(isDuplicateExists){
			this.setFocus('customerName');
		}		
	}

	//When processed flag exist or not 
	async checkProcessedFlag(itemrow,JobData,i){	
		if (!JobData.processedFlag) {
			//itemrow.controls['runDateWithPicker'].setValue(new Date(JobData.runDate));
			//itemrow.controls['runDate'].setValue(this.dtp.transform(new Date(JobData.runDate), 'MM/dd/yy'));
			let dateArray = JobData.runDate.split("/");
			this.jobDetailRunDate = dateArray[0] + "-" + dateArray[1] + "-20" + dateArray[2]; //MMddYYYY
			this.jobRecordId = JobData.jobRecordId;
			itemrow.controls['jobDetailRunDate'].setValue(this.jobDetailRunDate);
			itemrow.controls['jobName'].setValue(JobData.jobName);
			itemrow.controls['jobRecordId'].setValue(this.jobRecordId);
			if(await this.checkThisCombinationExistOrNot(i)){
				this.disableAndCreateNewRow(itemrow, i);				
			}else{
				this.disableRowsWhenInvalidData();
				this.popupService.openAlertDialog("Duplicate record(s) not allowed.", "Additional Charges", "check_circle", false);
			} 
		} else {
			this.disableRowsWhenInvalidData();
			this.popupService.openAlertDialog("Job already billed.", "Additional Charges", "check_circle", false);
		}
		
	}

	//when all data is valid in row disable it and create new row
		disableAndCreateNewRow(itemrow, i) {
		this.formArr.push(this.initItemRows());
		this.names = this.applicationArray;
		this.initializeAutocompleteApplication(i);
		this.initializeAutocompleteCustomer(i);
		this.initializeAutocompleteChargeType(i);
		if (i == 8) {
			//for getting scroll to bottom.
			var elmnt = document.getElementById("scrollToDown");
			elmnt.scrollIntoView({ behavior: "smooth" });
		}
		itemrow.showDeleteButton = true;
		itemrow.showAddButton = true;
		this.additionalChargesForm.controls.itemRows['controls'][i].showDeleteButton=true;
		this.disableRowsWhenInvalidData();		
	}

	addRunDateEvent(event, row, controlName1, controlName2) {
		var todaysDate = new Date(row.controls[controlName2].value);
		let currentDate = this.dtp.transform(todaysDate, 'MM/dd/yy').toString();
		row.controls[controlName1].setValue(currentDate);
	  }

	//set date into text field and vice versa
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
	}

	//delete row form additional charges form array
	async deleteRow(index: number) {
		const userresponse = await this.popupMessageService.openConfirmDialog("Are you sure you want to delete this row?", "help_outline", false);
		if (userresponse === "ok") {
			if(index==0 && this.additionalChargesForm.value.itemRows.length==1){
				this.AdditionalChargesFormInit();
				this.initializeAutocompleteApplication(0);
				this.initializeAutocompleteCustomer(0);
				this.initializeAutocompleteChargeType(0);
				this.setFocus('customerName');
			}else{
				if(index != 0 && index+1 == this.additionalChargesForm.value.itemRows.length )
					this.additionalChargesForm.controls.itemRows['controls'][index-1].showAddButton=false;
				this.formArr.removeAt(index);
			}
		}
	}

	//to change customer name on selecting customer code and vice versa
	isChangeInApplication(applicationObject: any, row: any, controlname: string, rowIndex, isAC: boolean) {
		let cCode = "", codeType = "";
		if (isAC) {
			cCode = applicationObject.source.value['applicationCode'].toLowerCase();
		}else {
			codeType = typeof row.controls["applicationCode"].value;
			cCode = codeType == 'string' ? row.controls["applicationCode"].value.toLowerCase() : row.controls["applicationCode"].value['applicationCode'];
			
		}

		if (cCode != null) {
			let dropdownFlag = false;
			let client = this.names.find(x=>x.applicationCode.toLowerCase() == cCode.toLowerCase());
			
			for (let name of this.customerNames) {
				if (client && name.customerId  === client.clientID) {
						row.controls['applicationCode'].setValue({ applicationCode: client.applicationCode });
						row.controls['applicationName'].setValue({ customerName: name.customerName });	
						dropdownFlag = true;
						this.setFocusOnSelect('customer');
						// if(this.customerMatched){
						// 	this.customerMatched=false;
						// 	this.setFocusOnSelect('customer');
						// }
						// if(isAC){
						// 	this.setFocusOnSelect('customer');
						// }

				}
			}
			if(!dropdownFlag && cCode !== null && cCode !== ""){
				//row.controls['applicationName'].setValue("");	
				this.additionalChargesForm.controls.itemRows['controls'][rowIndex].controls["applicationCode"].setErrors({'incorrectAppCode': true});
			}
		}

	}
	
	isChangeInCustomer(customerObject: any, row: any, controlname: string, rowIndex, isAC: boolean){
		row.controls['applicationCode'].setValue('');
		this.names = [];
		let cName = "";
		if (isAC) {
			cName = customerObject.source.value['customerName'].toLowerCase();
		}else {
			let codeType = typeof row.controls["applicationName"].value;
			cName = codeType == 'string' ? row.controls["applicationName"].value.toLowerCase() : row.controls["applicationName"].value['customerName'];
		}

		if (cName != null) {
			let dropdownFlag = false;
			for (let name of this.applicationArray) {
				if (name.customerName != null && name.customerName.toLowerCase() === cName.toLowerCase()) {
					 if (controlname === 'applicationName') {
						this.names.push(name);
						dropdownFlag = true
					}
				}
			}
			

				if(this.names.length == 1){
					row.controls['applicationCode'].setValue({applicationCode : this.names[0].applicationCode});
						this.setFocusOnSelect('customer');
				}
				else if(this.names.length > 1){
					this.setFocus('customerCode');
				}else{
					this.additionalChargesForm.controls.itemRows['controls'][rowIndex].controls["applicationName"].setErrors({'incorrectAppName': true});
				}
			
				this.initializeAutocompleteApplication(rowIndex);
			
		}
	}

	//initialize customer auto completes
	initializeAutocompleteApplication(no: number) {
		
		this.filteredOptionsApplicationCode = this.additionalChargesForm.controls.itemRows['controls'][no].controls["applicationCode"].valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value),
			map(name => name ? this._filterCode(name) : this.names.slice())
		);
		// this.filteredOptionsApplicationCode.subscribe(event =>{
		// 	let applicationCode = this.additionalChargesForm.controls.itemRows['controls'][no].controls["applicationCode"].value;
		// 	applicationCode = typeof applicationCode == 'object' ? applicationCode.applicationCode : applicationCode;
		// 	if(event.length==1 && event[0].applicationCode.toLowerCase()==applicationCode.toLowerCase()){
		// 		this.customerMatched=true;
				
		// 	}
		// 	else{
		// 		this.customerMatched=false;
		// 	}
			
		// });

	}

	//to initialize customer name and code to auto complete
	initializeAutocompleteCustomer(no: number) {
		this.filteredOptionsCustomer = this.additionalChargesForm.controls.itemRows['controls'][no].controls["applicationName"].valueChanges.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value),
				map(customername => customername ? this._filter(customername) : this.customerNames.slice())
			);
	}


	//customer name & code filter 
	private _filter(name: any): Customer[] {
		let filterValue;
		if (typeof name === 'string')
			filterValue = name.toLowerCase();
		else
			filterValue = name;
		return this.customerNames.filter(option => option.customerName.toLowerCase().indexOf(filterValue) === 0);
	}

	private _filterCode(name: any): Application[] {
		let filterValue;
		if (typeof name === 'string')
			filterValue = name.toLowerCase();
		else
			filterValue = name;
		return this.names.filter(option => option.applicationCode.toLowerCase().indexOf(filterValue) === 0);
	}

	displayFn(user?: Customer): string | undefined {
		return user ? user.customerName : undefined;
	}
	displayFnForCode(user?: Application): string | undefined {
		return user ? user.applicationCode : undefined;
	}


	//call service to get all Customers data 
	loadApplicationList() {
		//this.applicationList = this.customerservice.getAllCustomers();
		this.applicationList = this.applicationservice.getAllApplications();
		this.applicationList.subscribe(results => {
			this.names = results;
			this.applicationArray = results;
			this.names.sort((a, b) => (a.applicationName > b.applicationName) ? 1 : ((b.applicationName > a.applicationName) ? -1 : 0));
			this.initializeAutocompleteApplication(0);
			

		});
	}

	loadCustomerList() {
		this.customerList = this.customerservice.getAllCustomers();
		this.customerList.subscribe(results => {
			this.customerNames = results;
			this.customerNames.sort((a, b) => (a.customerName > b.customerName) ? 1 : ((b.customerName > a.customerName) ? -1 : 0));
			this.initializeAutocompleteCustomer(0);
		});
	}
	


	// To load FeeDescriptions data.
	loadAllFeeDescriptions() {
		this.allFeeDescription = this.feeDescriptionService.getAllFeeDescriptions(false);
		this.allFeeDescription.subscribe(results => {
			if (!results) { return };
			this.feeDescription = results;
			this.feeDescription.sort((a, b) => (a.description > b.description) ? 1 : ((b.description > a.description) ? -1 : 0));
			this.initializeAutocompleteChargeType(0);
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//initialize charge type auto completes
	initializeAutocompleteChargeType(no: number) {
		this.filteredOptionsChargeTypes = this.additionalChargesForm.controls.itemRows['controls'][no].controls["chargeType"].valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value),
			map(ChargeType => ChargeType ? this._filterChargeType(ChargeType) : this.feeDescription.slice())
		);
	}

	//Application name & code filter 
	private _filterChargeType(ChargeType: any): Feedescription[] {
		let filterValue;
		if (typeof ChargeType === 'string')
			filterValue = ChargeType.toLowerCase();
		else
			filterValue = ChargeType;
		return this.feeDescription.filter(option => option.description.toLowerCase().indexOf(filterValue) === 0);
	}

	displayFnForChargeType(ct?: Feedescription): string | undefined {
		return ct ? ct.description : undefined;
	}

	//call the service to save the entered data into db 
	async SaveChanges(finalObj,lastIndex) {
		if(await this.checkThisCombinationExistOrNot(lastIndex)){
			await this.AdditionalchargesService.AddUpdateAdditionCharges(finalObj).subscribe(() => {
				this.popupService.openAlertDialog("Record(s) saved successfully.", "Additional Charges", "check_circle", false);
				this.AdditionalChargesFormInit();
				this.names = this.applicationArray;
				this.initializeAutocompleteApplication(0);
				this.initializeAutocompleteCustomer(0);
				this.initializeAutocompleteChargeType(0);
			},
			(error) => {
				console.log(error);
			});
		}else{
			this.disableRowsWhenInvalidData();
			this.popupService.openAlertDialog("Duplicate record(s) not allowed.", "Additional Charges", "check_circle", false);
		}
	}

	async successAlert() {
		let res = await this.popupService.openAlertDialog("Record(s) saved successfully.", "Additional Charges", "check_circle", false);
	}

	//last row job validation
	lastRowJobValidation(): boolean {
		return true;
	}

	//submit Additional Charges Form, when click on save button
	lastClientCode = ""; lastClientName = "";
	async submitAdditionalChargesForm() {
		let finalChargesObject;
		let curruptRecordNumbers = "";
		if (this.checkDirtyFlag()) {
			let userdata = JSON.parse(sessionStorage.getItem('currentUser'));

			let tempObj = [];
			let len = this.additionalChargesForm.value.itemRows.length;
			for (var r = 0; r < len; r++) {
				this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationName"].enable();
				this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationCode"].enable();
				this.additionalChargesForm.controls.itemRows['controls'][r].controls["jobName"].enable();
				this.additionalChargesForm.controls.itemRows['controls'][r].controls["chargeType"].enable();
				let amount = this.additionalChargesForm.value.itemRows[r].amount;
				amount = amount==''|| amount =='.'|| amount==null ? 0 : +(String(amount.replace(/,/g, '')));
		
				if (this.additionalChargesForm.value.itemRows[r].applicationName &&this.additionalChargesForm.value.itemRows[r].applicationCode &&
					this.additionalChargesForm.value.itemRows[r].amount && amount >0 && this.additionalChargesForm.value.itemRows[r].chargeType &&
					this.additionalChargesForm.value.itemRows[r].runDate) {

						var setDate = new Date(this.additionalChargesForm.value.itemRows[r].runDate);
						let currentDate = this.dtp.transform(setDate, 'MM/dd/yy').toString();
						let dateArray = currentDate.split("/");
						//this.additionalChargesForm.value.itemRows[r].runDate.setValue(currentDate);
						//this.additionalChargesForm.value.itemRows[r].controls['runDate'].setValue(currentDate);
						//let dateArray = this.additionalChargesForm.value.itemRows[r].runDate.split("/");
						let selectedDate = dateArray[0] + "-" + dateArray[1] + "-20" + dateArray[2]; //MMddYYYY					
						let dateArray1 = new Date(selectedDate.toString());
					if (dateArray1.toString() != "Invalid Date") {
						let jNumber = "";
						jNumber = this.additionalChargesForm.controls.itemRows['controls'][r].controls["jobName"].value;
						let typeOfCode = typeof (this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationCode"].value);
						let typeOfName = typeof (this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationName"].value);
						//check type of customer name
						if (typeOfCode == "object") {
							this.lastClientCode = this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationCode"].value['applicationCode'];
						}
						else {
							this.lastClientCode = this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationCode"].value;
						}
						//check type of customer name
						if (typeOfName == "object") {
							this.lastClientName = this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationName"].value['customerName'];
						}
						else {
							this.lastClientName = this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationName"].value;
						}

						if (!jNumber.trim() || jNumber.trim() === ""){
							jNumber = this.generateJobNumber(this.lastClientCode);
							this.additionalChargesForm.controls.itemRows['controls'][r].controls["jobName"].setValue(jNumber);
						}
							



						let feeId;
						let feeDes = typeof this.additionalChargesForm.value.itemRows[r].chargeType;
						if (feeDes === "string") {
							feeDes = this.additionalChargesForm.value.itemRows[r].chargeType;
						}
						else {
							feeDes = this.additionalChargesForm.value.itemRows[r].chargeType.description;
							feeId = this.additionalChargesForm.value.itemRows[r].chargeType.recId;
						}

						if (feeDes.trim().length === 0) {
							curruptRecordNumbers += (r + 1) + ",";
						}
						let temp = {
							id: 0,
							runDate: selectedDate,
							jobName: jNumber,
							feeDesc: feeDes,
							chargeType: feeId,
							amount: this.additionalChargesForm.value.itemRows[r].amount,
							description: this.additionalChargesForm.value.itemRows[r].description,
							jobDetailRunDate: this.additionalChargesForm.value.itemRows[r].jobDetailRunDate,
							jobRecordId :  this.additionalChargesForm.value.itemRows[r].jobRecordId

						};
						tempObj.push(temp);
					} else { //invalid date
						curruptRecordNumbers += (r + 1) + ",";
					}
				} else {
					if (r === len - 1) {
						if (this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationName"].value === "" &&
							this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationCode"].value === "" &&
							this.additionalChargesForm.value.itemRows[r].amount === "" && this.additionalChargesForm.value.itemRows[r].chargeType === ""
							&& this.additionalChargesForm.value.itemRows[r].runDate === "") {

						} else {
							curruptRecordNumbers += (r + 1) + ",";
						}
					} else {
						curruptRecordNumbers += (r + 1) + ",";
					}
				}
			}

			finalChargesObject = {
				userName: userdata["firstName"] + " " + userdata["lastName"],
				additionalCharges: tempObj
			};
			if (curruptRecordNumbers === "") {
				this.validateLastJobNumber(finalChargesObject,r);
			} else {
				this.disableRowsWhenInvalidData();
				curruptRecordNumbers = curruptRecordNumbers.replace(/,(?=\s*$)/, '');

				this.popupService.openAlertDialog("Invalid data in the following row(s): " + curruptRecordNumbers, "Additional Charges", "check_circle", false);
			}
		} else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Additional Charges", "check_circle", false);
		}

	}


	disableRowsWhenInvalidData() {
		let r;
		let len = this.additionalChargesForm.value.itemRows.length;
		for (r = 0; r < len - 1; r++) {
			this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationName"].disable();
			this.additionalChargesForm.controls.itemRows['controls'][r].controls["applicationCode"].disable();
			this.additionalChargesForm.controls.itemRows['controls'][r].controls["jobName"].disable();
			this.additionalChargesForm.controls.itemRows['controls'][r].controls["chargeType"].disable();
			this.initializeAutocompleteApplication(r);
			this.initializeAutocompleteCustomer(r);
			this.initializeAutocompleteChargeType(r);
		}
		this.initializeAutocompleteApplication(r);
		this.initializeAutocompleteCustomer(r);
		this.initializeAutocompleteChargeType(r);
	}

	//validate last job number in last row
	async validateLastJobNumber(finalChargesObject,lastIndex) {
		this.jobRecordId = 0;
		let lent = finalChargesObject.additionalCharges.length;
		let jNumber = finalChargesObject.additionalCharges[lent - 1].jobName;
		//validate last customer data
		let isExist = false;
		for (let value of this.applicationArray) {
			if (value['applicationCode'].toLowerCase().trim() === this.lastClientCode.toLowerCase().trim()) {
				isExist = true;
			}
		}
		for (let value of this.customerNames) {
			if (value['customerName'].toLowerCase().trim() === this.lastClientName.toLowerCase().trim()) {
				isExist = true;
			}
		}
		if (isExist) { // last row customer validation
			if (!(jNumber.toLowerCase().endsWith("ac"))&&jNumber!="") {
				this.AdditionalchargesService.validateJobNumber(jNumber, this.lastClientCode).subscribe(results => {
					//if (!results) { return };
					let JobData = results[0];
					if (JobData == null) {
						this.additionalChargesForm.controls.itemRows['controls'][lent-1].controls["jobName"].setErrors({'inValid': true});
						this.disableRowsWhenInvalidData();
						this.popupService.openAlertDialog("Invalid data in the following row(s): " + lent + ".", "Additional Charges", "check_circle", false);
					}

					if(JobData.processedFlag){
						this.disableRowsWhenInvalidData();
						this.popupService.openAlertDialog("Job already billed for row: "+lent, "Additional Charges", "check_circle", false);
					}
					else {						
						let dateArray1 = JobData.runDate.split(" ");
						let dateArray = dateArray1[0].split("/");
						this.jobDetailRunDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]; //MMddYYYY
						this.jobRecordId = JobData.jobRecordId;
					
						//finalChargesObject.additionalCharges[lent - 1].runDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]; //MMddYYYY
						finalChargesObject.additionalCharges[lent - 1].jobDetailRunDate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2]; //MMddYYYY
						finalChargesObject.additionalCharges[lent - 1].jobRecordId = this.jobRecordId;
						finalChargesObject.additionalCharges[lent - 1].jobName = JobData.jobName;
						this.SaveChanges(finalChargesObject,lastIndex);
					}
				},
					(error) => {
						this.errorService.handleError(error);
					});

			} else {
				//check date is valid or not in last row
				if(this.checkJobNameFormat(this.lastClientCode,jNumber)){
					let lastDate = finalChargesObject.additionalCharges[lent - 1].runDate;
					finalChargesObject.additionalCharges[lent - 1].jobDetailRunDate = lastDate;
					let dateArray = lastDate.split("-");
					lastDate = new Date(dateArray[0] + "/" + dateArray[1] + "/" + dateArray[2]);
					if (lastDate != "Invalid Date") {
						this.SaveChanges(finalChargesObject,lastIndex);										
					} else {
						this.disableRowsWhenInvalidData();
						this.popupService.openAlertDialog("Invalid data in the following row(s): " + lent + ".", "Additional Charges", "check_circle", false);
					}
				}else{
					this.disableRowsWhenInvalidData();
					this.popupService.openAlertDialog("Invalid Job Name Format.", "Additional Charges", "check_circle", false);
				}
			}
		} else {
			this.disableRowsWhenInvalidData();
			this.popupMessageService.openAlertDialog("Invalid Customer Name or Customer Code.", "Additional Charges", "check_circle", false);
		}
	}

	

	//check dirty flag validation
	checkDirtyFlag() {
		let Flag = false;
		//let i = 0;
		if (this.additionalChargesForm.value.itemRows.length > 1) {
			Flag = true;
		} else {
			if (this.additionalChargesForm.value.itemRows[0].amount !== "" || this.additionalChargesForm.value.itemRows[0].chargeType !== "" ||
				this.additionalChargesForm.value.itemRows[0].description !== "" || this.additionalChargesForm.value.itemRows[0].jobName !== "" ||
				this.additionalChargesForm.value.itemRows[0].applicationCode !== "" || this.additionalChargesForm.value.itemRows[0].applicationName !== "" ||
				this.additionalChargesForm.value.itemRows[0].runDate !== "") {
				Flag = true;
			}
		}
		return Flag;
	}


	//to check if customer code and name is valid or not
	isCustomerValid(itemrow) {
		let isExist: boolean;
		let custCode = "", custName = "";
		let typeOfCustCode = typeof (itemrow.controls['applicationCode'].value);
		let typeOfCustName = typeof (itemrow.controls['applicationName'].value);
		if (typeOfCustCode == 'object') {
			custCode = itemrow.controls['applicationCode'].value["applicationCode"].toLowerCase().trim();
		} else {
			custCode = itemrow.controls['applicationCode'].value.toLowerCase().trim();
		}

		if (typeOfCustName == 'object') {
			custName = itemrow.controls['applicationName'].value["customerName"].toLowerCase().trim();
		} else {
			custName = itemrow.controls['applicationName'].value.toLowerCase().trim();
		}

		for (let value of this.applicationArray) {
			if (value['applicationName'].toLowerCase().trim() === custName) {
				isExist = true;
			}
		}
		for (let value of this.customerNames) {
			if (value['customerName'].toLowerCase().trim() === custName) {
				isExist = true;
			}
		}
		return isExist;
	}

	// reset the additional charges form
	async resetForm() {
		if (this.checkDirtyFlag()) {
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (response === "ok") {
				this.AdditionalChargesFormInit();
				this.names = this.applicationArray;
				this.initializeAutocompleteApplication(0);
				this.initializeAutocompleteCustomer(0);
				this.initializeAutocompleteChargeType(0);
				this.setFocus('customerName');
			
			}
		} else {
			this.names = this.applicationArray;
			this.AdditionalChargesFormInit();
			this.initializeAutocompleteApplication(0);
			this.initializeAutocompleteCustomer(0);
			this.initializeAutocompleteChargeType(0);
			this.setFocus('customerName');
		}

	}
	avoidSpecialCharcters(event){
		var regex = /^[a-zA-Z0-9]+$/g;
			return (regex.test(event.key));
	}

	checkJobNameFormat(custCode, jobName){
		let flag = false;
		jobName = jobName.toUpperCase();
		custCode = custCode.toUpperCase();
		let monthArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
		let d = new Date();
		let month = d.getMonth();
		let tday = d.getDate();
		let day = jobName.substring(5, 7);
		if(jobName.includes(custCode) && monthArray[month] == jobName[4] && day.includes(tday)){
			flag = true;
		}
		return flag;
	}

	//check errors
	public hasError = (controlName: string, itemrow, errorName: string) => {
		return itemrow.controls[controlName].hasError(errorName);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return !this.checkDirtyFlag();
	}

}

