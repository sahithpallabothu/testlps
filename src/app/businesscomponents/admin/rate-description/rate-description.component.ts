import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';

import { RateDescription } from '../../../businessclasses/admin/rate-description';
import { RateDescriptionService } from '../../../businessservices/admin/rate-description.service';

import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';

import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-crate-description',
	templateUrl: './rate-description.component.html',
	styleUrls: ['./rate-description.component.css']
})
export class RateDescriptionComponent implements OnInit {

	//Variable declarations.
	tableColumns: string[] = ['description', 'active'];
	dataSource = new MatTableDataSource<RateDescription>();
	@ViewChild(MatSort) sort: MatSort;

	highlightedRows = [];
	// search no data found
	isTableHasData = true;
	RateSelect = null;
	recordIdToUpdate = null;

	allRates: Observable<RateDescription[]>;
	errorMatcher = new ErrorMatcher();
	RateDescriptionForm: FormGroup;

	//allRunTypeOrders: Observable<Runtypeorder[]>;
	isUpdate: boolean = false;
	RunTypeSelect = null;
	currentRecordID: number;
	totalCount: number;
	rateDescriptionList: any = [];
	rateIdentifierName: string;
	searchText: string;
	ifFilterBySelected = true;
	isValid: boolean = true;
	result: any;
	isChangesExists: boolean = false;
	isRateIdentifierChanged: boolean = false;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	RunTypeID: string;
	public index: Number;

	isDescriptionChanged: boolean = false;
	isInUse: boolean = false;
	currentRowIndex: number = -1;
	@ViewChild('rateDesc') rateDesc: ElementRef;
	fromSave: boolean = false;
	hasScreenUpdatePriviledge = false;
	hasScreenInsertPriviledge = false;
	hasScreenDeletePriviledge = false;
	isAllowSave: boolean = false;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

	constructor(private formbulider: FormBuilder,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private rateDescriptionService: RateDescriptionService,
		private userPrivilegesService: UserPrivilegesService,
	) {
		//Set Department screen privileges
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenUpdatePriviledge = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenInsertPriviledge = true;
		}
		if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenDeletePriviledge = true;
			this.tableColumns = ['description', 'active', 'delete'];
		}
	}

	ngOnInit() {
		this.RateDescriptionForm = this.formbulider.group({
			description: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			active: ['true', []]
		});

		this.loadAllRates();
		this.dataSource.sort = this.sort;
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId].toLocaleLowerCase() === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};

		this.setSaveBtnEnable()
		this.setFocus();
	}

	//To set focus for first control in the form. 
	setFocus() {
		setTimeout(() => {
			this.rateDesc.nativeElement.setSelectionRange(this.rateDesc.nativeElement.value.length, this.rateDesc.nativeElement.value.length);
			this.rateDesc.nativeElement.focus();
		}, 0);
	}

	//Privilages
	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.recordIdToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.recordIdToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	//Load all Rates.
	async loadAllRates() {
		await this.rateDescriptionService.getAllRateDescriptions(true).subscribe(results => {
			if (!results) { return };
			this.dataSource.data = results;
			this.rateDescriptionList = results;
			this.dataSource.sort = this.sort;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;

			if (this.currentRowIndex >= 0) {
				this.loadCRateDescriptionToEdit(this.dataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	// form fields text changes.
	isChange() {
		this.isChangesExists = true;
		this.isDescriptionChanged = true;
	}


	onFormSubmit() {
		const rates = this.RateDescriptionForm.value;
		this.isDescriptionChanged = false;
		this.dataSource.data.forEach(item => {
			if (item.rateTypeID != this.recordIdToUpdate) {
				if (item.description.toLowerCase().trim() === rates.description.toLowerCase().trim()) {
					this.isDescriptionChanged = true;
				}
			}
		});
		if (!this.ValidatepRate() && !this.isDescriptionChanged) {
			if (this.recordIdToUpdate == null) {
				this.createRateDescription(rates);
			}
			else if (this.recordIdToUpdate != null && (this.isChangesExists || this.isDescriptionChanged)) {
				this.updateRateDescription(rates);
			}
		}

		else {
			if (this.isDescriptionChanged) {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Rate Type", "check_circle", false);
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Rate Type", "check_circle", false);
			}

		}
	}

	//Validation for duplicate entry.
	ValidatepRate() {
		const rateDescription = this.RateDescriptionForm.value;
		var dataChanged = false;
		if (this.highlightedRows.length > 0) {
			if (this.highlightedRows[0].description === rateDescription.description &&
				this.highlightedRows[0].active === rateDescription.active) {
				dataChanged = true;
			}
			else {
				dataChanged = false;
			}
		}
		else {
			if (this.recordIdToUpdate == null && ((rateDescription.description != "" && rateDescription.description != null) || !rateDescription.active)) {
				dataChanged = false;
			}
			else{
				dataChanged = true;
			}
		}

		return dataChanged;
	}

	// To highlight selected row in the grid.
	async selectRow(row: any) {
		if (!this.ValidatepRate()) {
			if (this.recordIdToUpdate != row.rateTypeID) {
				if (await this.checkDataChange()) {
					this.loadCRateDescriptionToEdit(row);
				}
			}
		}
		else {
			this.loadCRateDescriptionToEdit(row);
		}
	}

	async checkDataChange() {
		let rateDescription = this.RateDescriptionForm.value;
		if (this.recordIdToUpdate != null) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				return true;
			}
		}
		else {
			if (this.recordIdToUpdate == null && ((rateDescription.description != "" && rateDescription.description != null) || rateDescription.active === false)) {
				const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (userresponse === "ok") {
					return true;
				}
			}
			else {
				return true;
			}
		}
	}
	//Populate data into form on click of row in grid.
	loadCRateDescriptionToEdit(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		} else { if (row.isinuse === 'N') { this.RateDescriptionForm.controls['active'].enable(); } }

		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.recordIdToUpdate = row.rateTypeID;
		this.RateDescriptionForm.controls['description'].setValue(row.description);
		this.RateDescriptionForm.controls['active'].setValue(row.active);
		this.setFocus();
		this.setSaveBtnEnable();
	}

	//Add new Rate Description.
	createRateDescription(rateDescription: RateDescription) {
		this.rateDescriptionService.createRateDescription(rateDescription).subscribe(res => {
			this.saveData();
		},
			(error) => {
				this.rateDesc.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Rate Type", "check_circle", false);
		this.fromSave = true;
		this.loadAllRates();
		this.ResetChanges();
	}

	//Update existed data.
	async updateRateDescription(rateDescription: RateDescription) {
		rateDescription.rateTypeID = this.recordIdToUpdate;
		this.rateDescriptionService.updateRateDescription(rateDescription).subscribe(res => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Rate Type", "check_circle", false);
			this.recordIdToUpdate = null;
			this.isDescriptionChanged = false;
			this.loadAllRates();
			this.loadCRateDescriptionToEdit(this.dataSource.data[this.currentRowIndex]);
		},
			(error) => {
				this.rateDesc.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	//Delete RateDescription.
	async deleteRateDescription(id: number) {
		if(!this.ValidatepRate()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedRateDescription(id);				
			}
		}
		else{
			this.deleteSelectedRateDescription(id);	
		}		
	}

	async deleteSelectedRateDescription(id:number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.rateDescriptionService.deleteRateDescriptionById(id).subscribe(result => {
				if (result.message == MessageConstants.RECORDINUSE) {
					this.popupService.openAlertDialog(MessageConstants.RateDescription_RECORDINUSE, "Rate Type", "check_circle");
				}
				else {
					this.deleteData();
				}
			}, (error) => {
				this.errorService.handleError(error);
			});
		}
	}

	async deleteData() {
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Rate Type", "check_circle", false);
		this.loadAllRates();
		this.ResetChanges();
	}
	// To filter data in the grid.
	public doFilter(filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterData(filterValue);
			this.ResetChanges();
		}
		else {
			this.searchText = '';
			this.filterData(this.searchText);
		}
	}

	filterData(filterValue: string) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: string) => {
			if (this.validateWildCardType(data.description.toLowerCase(), filterValue.toLowerCase())) {
				return data.description;
			}
			return data.description.toLowerCase().indexOf(filter) != -1;
		}
		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;
	}

	//Validates the wild card search. 
	validateWildCardType(str, rule) {
		var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
	}
	omit_special_char(event) {
		let inputData = event.srcElement.value;
		let maxAllow = 0;
		if (inputData != undefined && inputData != '') {
			if (inputData[inputData.length - 1] == event.key && event.key == '*') {
				return false;
			}
			for (let i = 0; i < inputData.length; i++) {
				if (inputData[i] == '*') {
					maxAllow += 1;
					if (maxAllow == 2 && event.key == '*') {
						return false;
					}
				}

			}
		}
	}


	// reset form.
	async resetForm() {
		if (!this.ValidatepRate()) {
			if (await this.checkDataChange()) {
				this.ResetChanges();
				this.searchText = '';
				this.filterData(this.searchText);
			}
		}
		else {
			this.ResetChanges();
			this.searchText = '';
			this.filterData(this.searchText);
		}
	}

	//To clear form data.
	ResetChanges() {
		this.RateDescriptionForm.reset();
		this.recordIdToUpdate = null;
		this.highlightedRows.pop();
		this.isChangesExists = false;
		this.isInUse = false;
		this.isDescriptionChanged = false;
		this.RateDescriptionForm.controls['active'].setValue(true);
		this.currentRowIndex = -1;
		this.setFocus();
		this.setSaveBtnEnable();
	}

	public hasError = (controlName: string, errorName: string) => {
		return this.RateDescriptionForm.controls[controlName].hasError(errorName);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
		canDeactivate(): Observable<boolean> | boolean {
		
		return this.ValidatepRate();
	}
}



