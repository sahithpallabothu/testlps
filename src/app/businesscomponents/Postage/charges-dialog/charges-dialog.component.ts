import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogRef, } from "@angular/material";
import { FormControl, FormBuilder, FormArray, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator, MatRadioButton, MatRadioGroup, ErrorStateMatcher } from '@angular/material';
import { Postage, typeOfCharges } from '@/businessclasses/Postage/postage';
import { ChargeType } from '@/businessclasses/Application/application';
import { FeedescriptionService } from '@/businessservices/admin/feedescription.service';
import { ErrorHandlerService } from '@/shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { ValidateDecimalAndIntegers } from '../../../shared/validateDecimalAndIntegers';
import { Observable, Subject, empty } from 'rxjs';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Feedescription } from '@/businessclasses/admin/feedescription';
import { map, startWith } from 'rxjs/operators';

import { MessageConstants } from '@/shared/message-constants';
import { AdditionalchargesService } from '@/businessservices/additionalcharges/additionalcharges.service';

@Component({
	selector: 'app-charges-dialog',
	templateUrl: './charges-dialog.component.html',
	styleUrls: ['./charges-dialog.component.css'],

})
export class ChargesDialogComponent implements OnInit {
	chargesForm: FormGroup;
	title: string;
	description: string;
	icon: string;
	maxID: number;
	callFromDblClick: boolean = false;
	chargesData: any[] = [];
	isEdit: boolean = false;
	public AdditionalChargeForm: FormGroup;
	datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	editChargeIndex = 0;
	isChargesDataEdited: boolean = false;
	applicationId: number;
	chargeTypeText: string;
	lengthval: boolean;
	allChargeTypes: Observable<Feedescription[]>;
	currentUserSubject: Subject<boolean>;
	chargesArray = [];
	currentRunDate: string = "";
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	filteredOptionsChargeType: Observable<Feedescription[]>;
	filteredOptionsChargeTypeEdit: Observable<Feedescription[]>;
	maxDate = new Date();
	isViewACScreen: boolean = false;
	presentClientName = "";
	presentCustomerCode = "";
	presentJobName = "";
	@ViewChild('chargeType') chargeType: ElementRef;
	constructor(private _fb: FormBuilder,
		private popupService: PopupMessageService,
		private feedescriptionService: FeedescriptionService,
		private AdditionalchargesService: AdditionalchargesService,
		public dtp: DatePipe,
		public dp: DecimalPipe,
		private errorService: ErrorHandlerService,
		private dialogRef: MatDialogRef<ChargesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data) {

		this.title = data.title;
		this.maxID = data.maxVal_ID;
		if (data.callFromDblClick) {
			this.callFromDblClick = true;
			this.chargesData.push(data.tempData);
			this.applicationId = data.applicationID;
			if (data.isViewACScreen) {
				this.isViewACScreen = true;
				this.presentClientName = this.chargesData[0].clientName;
				this.presentCustomerCode = this.chargesData[0].customerCode;
				this.presentJobName = this.chargesData[0].jobNumber;
			}
		} else {
			this.chargesData = data.tempData;
			this.applicationId = data.applicationID;
			this.currentRunDate = data.runDate;
		}

		this.loadChargeTypes();
	}

	ngOnInit() {
			this.chargesForm = this._fb.group({
			editdatePickerInCharges: ['', [Validators.required, Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			editdatePickerInCharges1: [''],
			editchargesChargeType: ['', [Validators.required, this.ValidateAdditionalChargesSpaces]],
			editchargesAmount: ['', [Validators.required]], //Amount Pattern: , Validators.pattern(/^\d{0,3}(\,\d{1,3})?(\.\d{1,3})?$/)
			editchargesComments: ['', [this.ValidateAdditionalChargesSpaces]],

		});

		this.AdditionalChargesFormInit();
	}
	AdditionalChargesFormInit(){
		this.AdditionalChargeForm = this._fb.group({
			itemRows: this._fb.array([this.initItemRows()])
		});

	}

	validateForm() {
		if (this.callFromDblClick) {
			return !(this.chargesForm.valid);
		}
		else {
			return !(this.AdditionalChargeForm.valid);
		}
	}


	// To load all charge types related to a customer.
	chargeTypeArray: Feedescription[] = [];
	loadChargeTypes() {
		this.allChargeTypes = this.feedescriptionService.getAllFeeDescriptions();
		this.allChargeTypes.subscribe(results => {
			if (!results) { return };
			this.chargeTypeArray = results;
			this.chargesArray = results;
			this.loadCharges();
			this.initializeAutocompletechargeType(0);
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	initializeAutocompletechargeType(no: number) {
		this.filteredOptionsChargeType = this.AdditionalChargeForm.controls.itemRows['controls'][no].controls["chargesChargeType"].valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value),
			map(name => name ? this._filter(name) : this.chargesArray.slice())
		);
		//filteredOptionsChargeTypeEdit
		this.filteredOptionsChargeTypeEdit = this.chargesForm.controls['editchargesChargeType'].valueChanges.pipe(
			startWith(''),
			map(value => typeof value === 'string' ? value : value),
			map(name => name ? this._filter(name) : this.chargesArray.slice())
		);
	}

	//customer name & code filter 
	private _filter(name: any): Feedescription[] {
		let filterValue;
		if (typeof name === 'string')
			filterValue = name.toLowerCase();
		else
			filterValue = name;
		return this.chargesArray.filter(option => option.description.toLowerCase().indexOf(filterValue) === 0);
	}

	displayFn(feedesc?: Feedescription): string | undefined {
		return feedesc ? feedesc.description : undefined;
	}

	// dynamic row start
	get formArr() {
		return this.AdditionalChargeForm.get('itemRows') as FormArray;
	}

	initItemRows() {
		return this._fb.group({
			datePickerInCharges: ['', [Validators.required, Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			datePickerInCharges1: [''],
			chargesChargeType: ['', [Validators.required, this.ValidateAdditionalChargesSpaces]],
			chargesAmount: ['', [Validators.required]],
			chargesComments: ['', [this.ValidateAdditionalChargesSpaces]],
			ShowAddButton: false,
			ShowDeleteButton : false,
		});
	}

	async addNewRow(itemrow) {
		let flag = 0;
		for (var i = 0; i < this.AdditionalChargeForm.value.itemRows.length; i++) {
			let typeOfChargeType = typeof this.AdditionalChargeForm.value.itemRows[i].chargesChargeType;
			let chargeType = typeOfChargeType == 'object' ? this.AdditionalChargeForm.value.itemRows[i].chargesChargeType.description : this.AdditionalChargeForm.value.itemRows[i].chargesChargeType.trim();
			let amount = String(this.AdditionalChargeForm.value.itemRows[i].chargesAmount).replace(/,/g, '');
			if (amount == "" || amount == '.' || +amount <= 0 || chargeType === "" || this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges1 === "" || this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges === "") {
				flag++;
			}
		}
		if (flag === 0) {
			await this.formArr.push(this.initItemRows());
			await this.initializeAutocompletechargeType(i);
			if (i == 4) {
				this.scrollToDown();
			}
			itemrow.ShowAddButton = true;
			itemrow.ShowDeleteButton = true;
			this.AdditionalChargeForm.controls.itemRows['controls'][i].ShowDeleteButton=true;
		} else {
			this.popupService.openAlertDialog("Charge Type, Amount and Date fields are required.", "Add Charges", "check_circle", false);
		}
	}

	private ValidateAdditionalChargesSpaces(control: FormControl) {
		let isSpace;
		let isValid;
		let controlValue = typeof control.value === 'object' ? control.value.description : control.value;
		if (controlValue != null && controlValue !== 0) {
			isSpace = (controlValue || '').trim().length === 0 && controlValue != "";
			let splitted = controlValue.split(" ");
			// Start Space
			let firststring = splitted[0];
			// End Space
			let laststring = splitted[splitted.length - 1];

			isSpace = firststring.trim().length === 0 && controlValue != "";
			if (isSpace) {
				isValid = !isSpace;
				return isValid ? null : { 'space': true };
			}
			isSpace = laststring.trim().length === 0 && controlValue != "";
			isValid = !isSpace;
		}
		else {
			isValid = true;
		}
		return isValid ? null : { 'space': true };
	}

	addChargesToArray() {
		let udata = JSON.parse(sessionStorage.getItem('currentUser'));
		let curruptedRecordNumbers = "";
		//Dummy value for charge Id for updating.
		let chargeId = -1;
		let feeId = 0;
		let feeDesc = '';
		if (this.callFromDblClick) {
			if (typeof this.chargesForm.get("editchargesChargeType").value == 'object') {
				feeId = this.chargesForm.get("editchargesChargeType").value.recId;
				feeDesc = this.chargesForm.get("editchargesChargeType").value.description;
			}
			else {
				feeDesc = this.chargesForm.get("editchargesChargeType").value;
			}
			var chargeDate = this.chargesForm.get("editdatePickerInCharges").value !== null ? this.dtp.transform(this.chargesForm.get("editdatePickerInCharges").value, MessageConstants.DATEFORMAT).toString() : "";
			this.isChargesDataEdited = this.checkIfChargesDataChangedInEdit(feeDesc, chargeDate);
			if(this.isChargesDataEdited){
				this.chargesData[0].chargeDate = chargeDate;
				this.chargesData[0].chargeDate = this.chargesForm.get("editdatePickerInCharges").value !== null ? this.dtp.transform(this.chargesForm.get("editdatePickerInCharges").value, MessageConstants.DATEFORMAT).toString() : "";
				this.chargesData[0].feeId = feeId == 0 ? 0 : +feeId;
				this.chargesData[0].chargeType = feeDesc;
				this.chargesData[0].chargeAmount = this.chargesForm.get("editchargesAmount").value.replace(/,/g, '');
				this.chargesData[0].description = this.chargesForm.get("editchargesComments").value;
				this.chargesData[0].userName = udata['firstName'] + " " + udata['lastName'];
				}
			
		}
		else {
			for (var i = 0; i < this.AdditionalChargeForm.value.itemRows.length; i++) {
				
				if (typeof this.AdditionalChargeForm.value.itemRows[i].chargesChargeType === 'object') {
					feeId = this.AdditionalChargeForm.value.itemRows[i].chargesChargeType.recId;
					feeDesc = this.AdditionalChargeForm.value.itemRows[i].chargesChargeType.description;
				}
				else {
					feeDesc = this.AdditionalChargeForm.value.itemRows[i].chargesChargeType.trim();
				}
				let amount = String(this.AdditionalChargeForm.value.itemRows[i].chargesAmount).replace(/,/g, '');
				if (feeDesc != '' && amount != '' && amount != null && +amount > 0 && this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges1 != '' && this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges != "") {

					this.chargesData.push({
						"chargeId": chargeId,
						"feeId": feeId,
						"chargeType": feeDesc,
						"runDate": this.currentRunDate,
						"chargeAmount": this.AdditionalChargeForm.value.itemRows[i].chargesAmount.replace(/,/g, ''),
						"description": this.AdditionalChargeForm.value.itemRows[i].chargesComments,
						"chargeDate": this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges != "00/00/00" || this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges != "" ? this.dtp.transform(this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges, MessageConstants.DATEFORMAT).toString() : null,
						"userName": udata['firstName'] + " " + udata['lastName']
					});
					//Dummy value for charge Id for updating.
					chargeId--;
					feeId = 0;
					feeDesc = '';
					this.isChargesDataEdited = true;
				}
				else {
					if (feeDesc != '' || amount !== '' || this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges1 != '' || this.AdditionalChargeForm.value.itemRows[i].datePickerInCharges != '') {
						curruptedRecordNumbers += (i + 1) + ",";
					}
				}
			}
		}
		var chargesReturnData: any = {
			"chargesData": this.chargesData,
			"isChargesDataEdited": this.isChargesDataEdited
		}
		if (this.AdditionalChargeForm.valid || (!this.AdditionalChargeForm.valid && curruptedRecordNumbers == "")) {
			if (this.isChargesDataEdited) {
				if (this.isViewACScreen) {
					this.saveDetailsOfAdditionalCharge(chargesReturnData);
				} else {
					this.dialogRef.close(chargesReturnData);
				}
			}
			else{
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Add Charges", "check_circle",false);
			}
		}
		else {

			curruptedRecordNumbers = curruptedRecordNumbers.replace(/,(?=\s*$)/, '');
			this.popupService.openAlertDialog(MessageConstants.INVALID_DATA + curruptedRecordNumbers+'.', "Add Charges", "check_circle");
		}
	}

	//save changes in db when come from view ac screen
	saveDetailsOfAdditionalCharge(chargesReturnData) {

		let acObj = chargesReturnData.chargesData[0];
		acObj.runDate = this.currentRunDate;
		this.AdditionalchargesService.updateAdditionalChargeByID(acObj).subscribe(() => {
			chargesReturnData.isChargesDataEdited = true;
			this.dialogRef.close(chargesReturnData);
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Add Charges", "check_circle", false);
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	loadCharges() {
		if (this.callFromDblClick) {
			this.isEdit = true;
			if (this.chargesData[0].feeId) {
				var chargeData = this.chargeTypeArray.find(x => x.recId == this.chargesData[0].feeId);
			}
			this.chargesForm.controls["editdatePickerInCharges1"].setValue(new Date(this.chargesData[0].chargeDate));
			this.chargesForm.controls["editdatePickerInCharges"].setValue(this.dtp.transform(this.chargesData[0].chargeDate, MessageConstants.DATEFORMAT));
			this.chargesForm.controls["editchargesChargeType"].setValue({ 'description': this.chargesData[0].chargeType, 'recId': this.chargesData[0].feeId });
			this.chargesForm.controls["editchargesComments"].setValue(this.chargesData[0].description);
			this.chargesForm.controls["editchargesAmount"].setValue(this.dp.transform(String(this.chargesData[0].chargeAmount).replace(/,/g, ''), '1.3-3'));
		}
	}

	async deleteRow(index: number) {
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			if(index==0 && this.AdditionalChargeForm.value.itemRows.length==1){
				this.AdditionalChargesFormInit();
				this.initializeAutocompletechargeType(0);

			}else{
				if(index!=0 && (index+1) ==  this.AdditionalChargeForm.value.itemRows.length){
					
					this.AdditionalChargeForm.controls.itemRows['controls'][index-1].ShowAddButton=false;
				}
				
				this.formArr.removeAt(index);
			}
		}
	}

	// dynamic row end
	async dialogCancel() {

		if (this.callFromDblClick) {
			this.chargesData[0].chargeId = -1;
			let feeDesc = ""
			if (typeof this.chargesForm.get("editchargesChargeType").value == 'object') {
				feeDesc = this.chargesForm.get("editchargesChargeType").value.description;
			}
			else {
				feeDesc = this.chargesForm.get("editchargesChargeType").value;
			}
			var chargeDate = this.chargesForm.get("editdatePickerInCharges").value ;
			if (this.checkIfChargesDataChangedInEdit(feeDesc, chargeDate)) {
				const updateConfirmation = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (updateConfirmation === "ok") {
					this.dialogRef.close("");
				}
			}
			else {
				this.dialogRef.close("");
			}

		} else {

			if (this.AdditionalChargeForm.value.itemRows.length > 1 || this.AdditionalChargeForm.value.itemRows[0]["chargesChargeType"] != "" ||
				this.AdditionalChargeForm.value.itemRows[0]["chargesAmount"] != "" || this.AdditionalChargeForm.value.itemRows[0]["chargesComments"] != "" ||
				this.AdditionalChargeForm.value.itemRows[0]["datePickerInCharges"] != "") {
				const updateConfirmation = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (updateConfirmation === "ok") {
					this.dialogRef.close("");
				}
			}
			else {
				this.dialogRef.close("");
			}

		}
	}

	checkIfChargesDataChangedInEdit(feeDesc, chargeDate): boolean {
		let dbChargeDate = this.dtp.transform(this.chargesData[0].chargeDate, MessageConstants.DATEFORMAT).toString();
		if (dbChargeDate != chargeDate || this.chargesData[0].chargeType != feeDesc ||
			+(this.chargesData[0].chargeAmount) != +(String(this.chargesForm.get("editchargesAmount").value.replace(/,/g, ''))) ||
			this.chargesData[0].description != this.chargesForm.get("editchargesComments").value) {
			return true;
		}
		else {
			return false;
		}
	}

	//for getting scroll to bottom.
	scrollToDown() {
		var elmnt = document.getElementById("scrollToDownInCharges");
		elmnt.scrollIntoView({ behavior: "smooth" });
	}

	public hasError = (controlName: string, errorName: string) => {
		return this.chargesForm.controls[controlName].hasError(errorName);
	}

	inValidDate: boolean;
	setDateToPicker(controlName1, controlName2, row) {
		let dateToSet: any = new Date(row.controls[controlName1].value);

		if (dateToSet == "Invalid Date" || row.controls[controlName1].value == null || row.controls[controlName1].value == "") {
			this.inValidDate = !this.inValidDate;
			row.controls[controlName2].setValue("");
		}
		else {
			if(dateToSet > this.maxDate){
				row.controls[controlName1].setErrors({'incorrectDate': true});
			}
			else{
				row.controls[controlName2].setValue(dateToSet);
				row.controls[controlName1].setValue(this.dtp.transform(dateToSet,MessageConstants.DATEFORMAT).toString());
			}
			
		}
	}

	setDateToControl(event, controlName1, controlName2, row) {
		var dateEntered = this.dtp.transform(row.controls[controlName2].value, MessageConstants.DATEFORMAT).toString();
		row.controls[controlName1].setValue(dateEntered);
	}

	//for edit controls
	setDateToPickerInEdit(controlName1, controlName2) {
		let dateToSet: any = new Date(this.chargesForm.controls[controlName1].value);
		
		if (dateToSet == "Invalid Date" || this.chargesForm.controls[controlName1].value == null || this.chargesForm.controls[controlName1].value == "") {

			this.chargesForm.controls[controlName2].setValue("");
		}
		else {
			if(dateToSet > this.maxDate){
				this.chargesForm.controls[controlName1].setErrors({'incorrectDate': true});
			}
			else{
				this.chargesForm.controls[controlName2].setValue(dateToSet);
				this.chargesForm.controls[controlName1].setValue(this.dtp.transform(dateToSet, MessageConstants.DATEFORMAT).toString());
			}
			
		}
	}

	setDateToControlInEdit(event, controlName1, controlName2) {
		var dateEntered = this.dtp.transform(this.chargesForm.controls[controlName2].value, MessageConstants.DATEFORMAT).toString();
		this.chargesForm.controls[controlName1].setValue(dateEntered);
	}

	public hasErrorDynamic = (controlName: string, errorName: string, row) => {
		return row.controls[controlName].hasError(errorName);
	}

	changeToAmountPattern(controlName: string, row) {
		if (row == -1) {
			let amount = String(this.chargesForm.controls[controlName].value).replace(/,/g, '');
			if (amount != '.' && amount != '' && amount != null && +amount > 0) {
				this.chargesForm.controls[controlName].setValue(this.dp.transform(amount, '1.3-3'));
			}
			else {
				if( amount != ''){
					this.chargesForm.controls['editchargesAmount'].setErrors({ 'incorrectAmount': true });
				}
				
			}

		}
		else {
			let amount = String(row.controls[controlName].value).replace(/,/g, '');
			if (amount != '.' && amount != '' && amount != null && +amount > 0) {
				row.controls[controlName].setValue(this.dp.transform(amount, '1.3-3'));
			}
			else {
				if( amount != ''){
					row.controls['chargesAmount'].setErrors({ 'incorrectAmount': true });
				}
			}
		}

	}

	//key press event for amount.
	validateDecimals(key) {
		return ValidateDecimalAndIntegers.validateDecimals(key);
	}

}

