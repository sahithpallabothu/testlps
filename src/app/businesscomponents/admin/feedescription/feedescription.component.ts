import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Feedescription } from '../../../businessclasses/admin/feedescription';
import { FeedescriptionService } from '../../../businessservices/admin/feedescription.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-feedescription',
	templateUrl: './feedescription.component.html',
	styleUrls: ['./feedescription.component.css']
})
export class FeedescriptionComponent implements OnInit {

	// variable declarations.
	feeDescriptionForm: FormGroup;
	@ViewChild('feeDescription') feeDescription: ElementRef;	// to set foucs. 
	searchText: string;
	isValid: boolean = true;
	result: any;
	isChangesExists: boolean = false;
	isDescriptionChanged: boolean = false;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	// table declarations.
	tableColumns: string[] = ['description', 'active'];
	dataSource = new MatTableDataSource<Feedescription>();
	@ViewChild(MatSort) sort: MatSort;
	isTableHasData = true;
	allFeeDescription: Observable<Feedescription[]>;
	feeDescArray: Feedescription[] = []
	feeDescriptionToUpdate = null;
	highlightedRows = [];
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	isInUse: boolean = false;
	@ViewChild('f') myForm;
	currentRowIndex: number = -1;
	fromSave: boolean = false;
	hasScreenUpdatePriviledge = false;
	hasScreenInsertPriviledge = false;
	hasScreenDeletePriviledge = false;
	isAllowSave: boolean = false;
	errorMatcher = new ErrorMatcher();
	constructor(
		private formbulider: FormBuilder,
		private feeDescriptionService: FeedescriptionService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
	) {

		//Set feeDescription screen privileges
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenUpdatePriviledge = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenInsertPriviledge = true;
		}
		if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenDeletePriviledge = true;
		}
	}

	ngOnInit() {
		this.feeDescriptionForm = this.formbulider.group({
			description: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			active: ['true', []]
		});
		this.setFocus();
		this.loadAllFeeDescriptions();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId].toLocaleLowerCase() === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		this.setSaveBtnEnable()
		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['description', 'active', 'delete'];
		}
	}

	// To show Validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.feeDescriptionForm.controls[controlName].hasError(errorName);
	}

	//to disable or enable save button based on privilege.
	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.feeDescriptionToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.feeDescriptionToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	//to set focus.
	setFocus() {
		setTimeout(() => {
			this.feeDescription.nativeElement.setSelectionRange(this.feeDescription.nativeElement.value.length, this.feeDescription.nativeElement.value.length);
			this.feeDescription.nativeElement.focus();
		}, 0);
	}

	// To load FeeDescriptions data.
	loadAllFeeDescriptions() {
		this.allFeeDescription = this.feeDescriptionService.getAllFeeDescriptions(true);
		this.allFeeDescription.subscribe(results => {
			if (!results) { return };
			this.feeDescArray = results;
			this.dataSource.data = results;
			this.dataSource.sort = this.sort;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
			if (this.currentRowIndex >= 0) {
				this.loadFeeDescriptionToEdit(this.dataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	onFormSubmit() {
		const feeDesc = this.feeDescriptionForm.value;
		this.isDescriptionChanged = false;
		for (let item of this.feeDescArray) {
			if (item.recId !== this.feeDescriptionToUpdate) {
				if (item.description.toLowerCase().trim() === feeDesc.description.toLowerCase().trim()) {
					this.isDescriptionChanged = true;
				}
			}
		}
		if (!this.ValidateFeeDescription() && !this.isDescriptionChanged) {
			if (this.feeDescriptionToUpdate == null) {
				this.createFeeDescription(feeDesc);
			}
			else if (this.feeDescriptionToUpdate != null && (this.isChangesExists || this.isDescriptionChanged)) {
				this.updateFeeDescription(feeDesc);
			}
		}
		else {
			if (this.isDescriptionChanged) {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Fee Description", "check_circle", false);
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Fee Description", "check_circle", false);
			}
		}
	}

	// To filter data in the grid.
	public doFilter(filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterDataSource(filterValue);
			this.ResetChanges();
		}
		else {
			this.searchText = '';
			this.filterDataSource(this.searchText);
		}
	}
	filterDataSource(filterValue: string) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: string) => {
			if (this.validateWildCardType(data.description.toLowerCase(), filterValue.toLowerCase())) {
				return data.description;
			}
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

	//Form field change event.
	isChange() {
		this.isDescriptionChanged = true;
		this.isChangesExists = true;
	}

	// Validation for duplicate description.
	ValidateFeeDescription() {
		const feeDesc = this.feeDescriptionForm.value;
		var dataChanged = false;
		if (this.highlightedRows.length > 0) {
			if (this.highlightedRows[0].description === feeDesc.description &&
				this.highlightedRows[0].active === feeDesc.active) {
				dataChanged = true;
			}
			else {
				dataChanged = false;
			}
		}
		else {
			if (this.feeDescriptionToUpdate == null && ((feeDesc.description != "" && feeDesc.description != null) || !feeDesc.active)) {
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
		if (!this.ValidateFeeDescription()) {
			if (this.feeDescriptionToUpdate != row.recId) {
				if (await this.checkDataChange()) {
					this.loadFeeDescriptionToEdit(row);
				}

			}
		}
		else {
			this.loadFeeDescriptionToEdit(row);
		}
	}

	async checkDataChange() {
		let feeDesc = this.feeDescriptionForm.value;
		if (this.feeDescriptionToUpdate != null) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				return true;
			}
		}
		else {
			if (this.feeDescriptionToUpdate == null && ((feeDesc.description != "" && feeDesc.description != null) || feeDesc.active === false)) {
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

	// To update FeeDescription data.	
	loadFeeDescriptionToEdit(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.setFocus();
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.SetFeeDescriptionChanges(false);
		this.feeDescriptionToUpdate = row.recId;
		this.feeDescriptionForm.controls['description'].setValue(row.description);
		this.feeDescriptionForm.controls['active'].setValue(row.active);
		this.setSaveBtnEnable();
	}

	// To save FeeDescription data.
	async createFeeDescription(result: Feedescription) {
		this.feeDescriptionService.createFeeDescription(result).subscribe(
			() => {
				this.saveData()
			},
			(error) => {
				this.feeDescription.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Fee Description", "check_circle", false);
		this.fromSave = true;
		this.loadAllFeeDescriptions();
		this.ResetChanges();
	}

	// To update FeeDescription data.
	updateFeeDescription(result: Feedescription) {
		result.recId = this.feeDescriptionToUpdate;
		this.feeDescriptionService.updateFeeDescription(result).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Fee Description", "check_circle", false);
			this.feeDescriptionToUpdate = null;
			this.SetFeeDescriptionChanges(false);
			this.loadAllFeeDescriptions();
			this.loadFeeDescriptionToEdit(this.dataSource.data[this.currentRowIndex]);
		},
			(error) => {
				this.feeDescription.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	// To delete FeeDescription.	
	async deleteFeeDescription(recId: number) {
		if(!this.ValidateFeeDescription()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedFeeDescription(recId);				
			}
		}
		else{
			this.deleteSelectedFeeDescription(recId);
		}		
	}
	async deleteSelectedFeeDescription(recId: number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.feeDescriptionService.deleteFeeDescriptionById(recId).subscribe(result => {
				if (result.message == MessageConstants.RECORDINUSE) {
					this.popupService.openAlertDialog(MessageConstants.FEEDESCRIPTION_RECORDINUSE, "Fee Description", "check_circle");
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
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Fee Description", "check_circle", false);
		this.loadAllFeeDescriptions();
		this.ResetChanges();
	}

	// To Clear Form data.
	async resetForm() {
		if (!this.ValidateFeeDescription()) {
			if (await this.checkDataChange()) {
				this.ResetChanges();
				this.searchText = '';
				this.filterDataSource(this.searchText);
			}
		}
		else {
			this.ResetChanges();
			this.searchText = '';
			this.filterDataSource(this.searchText);
		}

	}

	//to reset data.
	ResetChanges() {
		this.highlightedRows.pop();
		this.myForm.resetForm();
		this.currentRowIndex = -1;
		this.feeDescriptionToUpdate = null;
		this.isInUse = false;
		this.feeDescriptionForm.controls['active'].setValue(true);
		this.SetFeeDescriptionChanges(false);
		this.setSaveBtnEnable();
		this.setFocus();
	}

	SetFeeDescriptionChanges(value: boolean) {
		this.isDescriptionChanged = value;
		this.isChangesExists = value;
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return this.ValidateFeeDescription();
	}

}//Component ends here. 

