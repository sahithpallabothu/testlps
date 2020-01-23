import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Flagtype } from '../../../businessclasses/admin/flagtype';
import { FlagtypeService } from '../../../businessservices/admin/flagtype.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-flagtype',
	templateUrl: './flagtype.component.html',
	styleUrls: ['./flagtype.component.css']
})
export class FlagtypeComponent implements OnInit {

	// Variable declarations.
	flagtypeForm: FormGroup;
	searchText: string;
	isValid: boolean = true;
	result: any;
	isChangesExists: boolean = false;
	isDescriptionChanged: boolean = false;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

	//Table declarations.
	tableColumns: string[] = ['description'];
	dataSource = new MatTableDataSource<Flagtype>();
	@ViewChild(MatSort) sort: MatSort;
	allFlagtypes: Observable<Flagtype[]>;
	flagtypeIdToUpdate = null;
	highlightedRows = [];
	isTableHasData = true;
	errorMatcher = new ErrorMatcher()
	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;
	isInUse: boolean = false;
	currentRowIndex: number = -1;
	fromSave: boolean = false;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	//To set focus
	@ViewChild('f') myForm;
	@ViewChild('flagId') flagId: ElementRef;
	@ViewChild('filterText') filterText: ElementRef;
	isExistInSession = false;
	constructor(private formbulider: FormBuilder,
		private flagtypeservice: FlagtypeService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
	) {
		//Set Flag screen privileges
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
		this.flagtypeForm = this.formbulider.group({
			//flagId: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(2)]],
			description: ['', [Validators.required, Validators.maxLength(50), SpaceValidator.ValidateSpaces]]
		});
		this.loadAllFlagtypes();
		this.loadSearchCriteria();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		this.setFocus();
		this.setSaveBtnEnable();
		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['description', 'delete'];
		}
	}

	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.flagtypeIdToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.flagtypeIdToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}

	}
	setFocus() {
		setTimeout(() => {
			this.flagId.nativeElement.setSelectionRange(this.flagId.nativeElement.value.length, this.flagId.nativeElement.value.length);
			this.flagId.nativeElement.focus();
		}, 0);
	}

	// To show validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.flagtypeForm.controls[controlName].hasError(errorName);
	}

	// To Load FlagType data.
	loadAllFlagtypes() {
		this.allFlagtypes = this.flagtypeservice.getAllFlagtypes(true);
		this.allFlagtypes.subscribe(results => {
			if (!results) { return };
			this.dataSource.data = results;
			this.dataSource.sort = this.sort;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
			if (this.currentRowIndex >= 0) {
				this.selectRow(this.dataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.dispCustomErrorMessage("Could not get Flag Types - Please check your access rights.");
			});
	}

	//load search criteria from local storage.
	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.flagSubmenu) : -1;
		if (index == -1) {
			this.isExistInSession = false;
		}
		else {
			this.isExistInSession = true;
		}
	}

	
	public selectedoption = 1;
	//on change in serch by drop down
	checkFilterBySelected() {
		this.searchText = "";
		this.setSearchTextFocus();
	}

	//to set focus for search text.
	setSearchTextFocus() {
		setTimeout(() => {
			this.filterText.nativeElement.focus();
		}, 0);
	}

	onFormSubmit() {
		const flagtype = this.flagtypeForm.value;
		flagtype.description = flagtype.description.trim();
		if (this.isChangesExists) {
			this.result = this.ValidateFlagType(flagtype);
			if (this.result) {
				if (this.flagtypeIdToUpdate == null)
					this.createFlagtype(flagtype);
				else if (this.flagtypeIdToUpdate != null && this.isChangesExists)
					this.updateFlagType(flagtype);
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Flag", "check_circle", false);
		}
	}



	// search elements in table. 
	public doFilter(filterValue: string) {
		if ((filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined)) {
			this.filterDataSource(filterValue, true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() != "") || filterValue == "" || filterValue == null || filterValue == undefined) {
			this.searchText = "";
			this.filterDataSource(this.searchText, false);
		}

	}

	filterDataSource(filterValue: string, localStorageFlag) {
		if (filterValue != "" && filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: any) => {
			if (this.validateWildCardType(data.description.toLowerCase(), filterValue.toLowerCase())) {
				return data.description;
			}
		}
		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;

		//storing search criteria to local storage.
		if (localStorageFlag) {
			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.flagSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				searchCriteriaObj.push({ screenName: Constants.flagSubmenu});
			}
			/* else {
				searchCriteriaObj[index].searchBy = selectedVal;
			} */
			localStorage.setItem("searchCriteriaObj", JSON.stringify(searchCriteriaObj));
		}
	}

	//Validates the wild card search. 
	validateWildCardType(str, rule) {
		var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
	}

	//omit special characters.
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
		this.isChangesExists = true;
	}

	// Validation for duplicate description.
	ValidateFlagType(oFlagtype: Flagtype): boolean {
		this.isValid = true;
		this.dataSource.data.forEach(item => {
			if (this.flagtypeIdToUpdate == null) {
				if (item.description.toLowerCase() == oFlagtype.description.toLowerCase()) {
					this.isValid = false;
				}
			}
			else {
				if (item.flagId != this.flagtypeIdToUpdate) {
					if (item.description.toLowerCase() === oFlagtype.description.toLowerCase()) {
						this.isValid = false;
					}
				}
				else {
					if (item.description === oFlagtype.description) {
						this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Flag", "check_circle", false);
						this.isChangesExists = false;
						return this.isValid;
					}
				}
			}
		});

		if (!this.isValid) {
			this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Flag", "check_circle", false);
			return this.isValid;
		}
		return this.isValid;
	}

	// To highlight selected row in the grid.
	async selectRow(row) {
		if (this.checkData()) {
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.populateData(row);
				this.isChangesExists = false;
			}
		}
		else {
			this.isChangesExists = false;
			this.populateData(row);
		}
	}

	//check data change. 
	checkData() {
		const flagtype: Flagtype = this.flagtypeForm.value;
		let changesExist = false;
		if (this.isChangesExists) {
			if (this.flagtypeIdToUpdate == null) {
				if ((flagtype.description && flagtype.description != '')) {
					changesExist = true;
				}
			} else {
				for (let i = 0; i < this.dataSource.data.length; i++) {
					if (this.dataSource.data[i].flagId == this.flagtypeIdToUpdate) {
						if (this.dataSource.data[i].description != flagtype.description.trim()) {
							changesExist = true;
							break;
						}
					}
				}
			}
		}
		else {
			changesExist = false;
		}
		return changesExist;
	}

	//populate data.
	populateData(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.setFocus();
	
		this.SetFlagTypeChanges(false);
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.loadFlagtypeToEdit(row);
	}

	// To Update FlagType Data.
	loadFlagtypeToEdit(row: any) {
		this.flagtypeIdToUpdate = row.flagId;
		this.flagtypeForm.controls['description'].setValue(row.description.trim());
		this.setSaveBtnEnable();
	}

	// To save and Update FlagType.
	async createFlagtype(oFlagtype: Flagtype) {
		this.flagtypeservice.createFlagtype(oFlagtype).subscribe(() => {
			this.saveData()
		});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Flag", "check_circle", false);
		this.isChangesExists = false;
		this.fromSave = true;
		this.loadAllFlagtypes();
		this.ResetChanges();
	}

	// To Update Flag Type
	updateFlagType(oFlagtype: Flagtype) {

		oFlagtype.flagId = this.flagtypeIdToUpdate;
		this.flagtypeservice.updateFlagtype(oFlagtype).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Flag", "check_circle", false);
			this.isChangesExists = false;
			this.loadAllFlagtypes();
			//this.ResetChanges();
		});
	}

	// To delete FlagType data.
	async deleteFlagtype(flagId: number) {
		if(this.checkData()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedFlag(flagId);				
			}
		}
		else{
			this.deleteSelectedFlag(flagId);	
		}	
	}
	
	async deleteSelectedFlag(flagId: number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.flagtypeservice.deleteFlagtypeById(flagId).subscribe(result => {
				if (result.message == MessageConstants.RECORDINUSE) {
					this.popupService.openAlertDialog(MessageConstants.FLAG_RECORDINUSE, "Flag ", "check_circle");
				}
				else {
					this.deleteData();
				}
			});
		}
	}

	async deleteData() {
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Flag ", "check_circle", false);
		this.loadAllFlagtypes();
		this.ResetChanges();
	}

	// To clear data in the form.
	async resetForm() {
		if (this.checkData()) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.ResetChanges();
				this.searchText = "";
				this.filterDataSource(this.searchText, false);
				this.loadSearchCriteria();
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			this.filterDataSource(this.searchText, false);
			this.loadSearchCriteria();
		}
	}

	ResetChanges() {
		this.highlightedRows.pop();
		//this.flagtypeForm.reset();
		this.myForm.resetForm();
		this.flagtypeIdToUpdate = null;
		this.SetFlagTypeChanges(false);
		this.isValid = true;
		this.setFocus();
		this.currentRowIndex = -1;
		this.isInUse = false;
		this.setSaveBtnEnable();

	}

	SetFlagTypeChanges(value: boolean) {
		this.isChangesExists = value;
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return !this.checkData();
	}
}



