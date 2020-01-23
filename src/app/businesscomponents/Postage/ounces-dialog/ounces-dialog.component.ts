import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormBuilder, FormGroup } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { ValidateDecimalAndIntegers } from '@/shared/validateDecimalAndIntegers';
import { Postage } from '@/businessclasses/Postage/postage';

@Component({
	selector: 'app-ounces-dialog',
	templateUrl: './ounces-dialog.component.html',
	styleUrls: ['./ounces-dialog.component.css']
})
export class OuncesDialogComponent implements OnInit {

	ouncesForm: FormGroup;
	title: string;
	description: string;
	ouncesDetailsArray: any[] = [];
	ouncesUpdateObject: any[] = [];
	jobDetailArray : any[] = [];
	icon: string;
	ouncesControlArray: string[] = ['oz1', 'oz2', 'oz3', 'oz4', 'oz5', 'oz6', 'oz7', 'oz8', 'oz9', 'oz10', 'oz11', 'oz12',
		'oz13', 'oz14', 'oz15', 'oz16', 'ozPermit2', 'ozSingle2'];
	postageJobNumber: string;
	typeCodeAndRate: any;
	hasUpdateOuncesAccess: boolean;
	isOuncesChanged: boolean = false;
	uspsOuncesTotal = 0;
	constructor(
		private fb: FormBuilder,
		private dp: DecimalPipe,
		private popupService: PopupMessageService,
		private dialogRef: MatDialogRef<OuncesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data) {
		this.title = data.title;//data from postage
		this.jobDetailArray = data.JobDetailData;

	}

	ngOnInit() {
		this.ouncesForm = this.fb.group({
			oz1: ['', []],
			oz1Amount: ['', []],
			ozPermit2: ['', []],
			ozPermit2Amount: ['', []],
			ozSingle2: ['', []],
			ozSingle2Amount: ['', []],
			oz2: ['', []],
			oz2Amount: ['', []],
			oz3: ['', []],
			oz3Amount: ['', []],
			oz4: ['', []],
			oz4Amount: ['', []],
			oz5: ['', []],
			oz5Amount: ['', []],
			oz6: ['', []],
			oz6Amount: ['', []],
			oz7: ['', []],
			oz7Amount: ['', []],
			oz8: ['', []],
			oz8Amount: ['', []],
			oz9: ['', []],
			oz9Amount: ['', []],
			oz10: ['', []],
			oz10Amount: ['', []],
			oz11: ['', []],
			oz11Amount: ['', []],
			oz12: ['', []],
			oz12Amount: ['', []],
			oz13: ['', []],
			oz13Amount: ['', []],
			oz14: ['', []],
			oz14Amount: ['', []],
			oz15: ['', []],
			oz15Amount: ['', []],
			oz16: ['', []],
			oz16Amount: ['', []],
		});
		this.loadDataIntoControls();
		this.EnableOrDisableFormControls(false);
	}

	//populating data
	loadDataIntoControls() {
		this.ouncesControlArray.forEach(ounceName =>{
				this.ouncesForm.controls[ounceName].setValue(this.changeToPiecesFormat(this.jobDetailArray[ounceName]));
		});
	}

	EnableOrDisableFormControls(isEnable: Boolean = true){
		for (var control in this.ouncesForm.controls) {
			isEnable ? this.ouncesForm.controls[control].enable() : this.ouncesForm.controls[control].disable();
		}

	}

	/* filter for pieces */
	changeToPiecesFormat(pieces: any): string {
		let formatedPices = this.dp.transform(String(pieces).replace(/,/g, ''), '1.0-0');
		return formatedPices;
	}

	//filter for amount
	changeToAmountFormat(pieces: any): string {
		let formatedAmount = this.dp.transform(String(pieces).replace(/,/g, ''), '1.3-3');
		return formatedAmount;
	}

	

	//on cancel button click
	dialogCancel() {
		this.dialogRef.close();
	}

	//show errors after validating.
	public hasError = (controlName: string, errorName: string) => {
		return this.ouncesForm.controls[controlName].hasError(errorName);
	}
}


