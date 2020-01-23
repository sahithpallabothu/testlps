import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';
import { States } from '../../../businessclasses/admin/states';
import { StatesService } from '../../../businessservices/admin/states.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-states',
	templateUrl: './states.component.html',
	styleUrls: ['./states.component.css']
})
export class StatesComponent implements OnInit {

	//Variable declarations.
	statesForm: FormGroup;
	searchText: string;
	isValid: boolean = true;
	isChangesExists: boolean = false;
	result: any;
	isstateCodechanged: boolean = false;

	//table declarations.
	tableColumns: string[] = ['stateCode', 'stateName'];
	dataSource = new MatTableDataSource<States>();
	allstates: Observable<States[]>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('filterText') filterText: ElementRef;
	@ViewChild('stateCodeFocus') stateCodeFocus: ElementRef;
	// search no data found
	isTableHasData = true;
	highlightedRows = [];
	idToUpdate = null;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	errorMatcher = new ErrorMatcher();

	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;
	currentRowIndex: number = -1;
	fromSave: boolean = false;
	isInUse: boolean = false;
	@ViewChild('f') myForm;
	isExistInSession = false;
	constructor(private formbulider: FormBuilder,
		private stateService: StatesService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
	) {
		//Set Customer screen privileges
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
		this.statesForm = this.formbulider.group({
			stateCode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/), SpaceValidator.ValidateSpaces]],
			stateName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/), SpaceValidator.ValidateSpaces]]
		});

		this.loadAllStates();
		this.loadSearchCriteria();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		if(this.hasScreenDeletePriviledge){
			this.tableColumns =  ['stateCode', 'stateName','delete'];
		}
		this.setFocus();
		this.setSaveBtnEnable();
	}

	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.idToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.idToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	setFocus() {
		setTimeout(() => {
			this.stateCodeFocus.nativeElement.setSelectionRange(this.stateCodeFocus.nativeElement.value.length, this.stateCodeFocus.nativeElement.value.length);
			this.stateCodeFocus.nativeElement.focus();
		}, 0);
	}



	//to show validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.statesForm.controls[controlName].hasError(errorName);
	}

	// on Form Submit.
	onFormSubmit() {
		const state = this.statesForm.value;
		this.isstateCodechanged = false;
		this.dataSource.data.forEach(item => {
			if (item.stateID != this.idToUpdate) {
				if (item.stateCode.toLowerCase().trim() === state.stateCode.toLowerCase().trim() || item.stateName.toLowerCase().trim() === state.stateName.toLowerCase().trim()) {
					this.isstateCodechanged = true;
				}
			}
		});
		if (!this.ValidateState() && !this.isstateCodechanged) {
			if (this.idToUpdate == null)
				this.createState(state);
			else if (this.idToUpdate != null && (this.isChangesExists || this.isstateCodechanged))
				this.updateState(state);
		}
		else {
			if (this.isstateCodechanged) {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "States", "check_circle", false);
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "States", "check_circle", false);
			}
		}
	}

	public searchOptions = [
		{ "id": 1, "name": "State Code" },
		{ "id": 2, "name": "State Name" },
	]
	public selectedoption = 1;
	checkFilterBySelected() {
		this.searchText = "";
		this.setSearchTextFocus()
	}

	//to set focus for search text.
	setSearchTextFocus() {
		setTimeout(() => {
			this.filterText.nativeElement.focus();
		}, 0);
	}
	//load All States.	
	loadAllStates() {
		this.allstates = this.stateService.getAllStates(true);
		this.allstates.subscribe(results => {
			if (!results) { return };
			this.dataSource.data = results;
			this.dataSource.sort = this.sort;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
			if (this.currentRowIndex >= 0) {
				this.loadStateToEdit(this.dataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//load search criteria from local storage.
	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.statesSubmenu) : -1;
		if (index == -1) {
			this.selectedoption = 1;
			this.isExistInSession = false;
		}
		else {
			this.selectedoption = searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}

	// reset form.
	async resetForm() {
		if (!this.ValidateState()) {
			if (await this.checkDataChange()) {
				this.ResetChanges();
				this.searchText = "";
				if (!this.isExistInSession) {
					this.selectedoption = 1;
				}
				this.filterData(this.selectedoption, this.searchText, false);
				this.loadSearchCriteria();
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			if (!this.isExistInSession) {
				this.selectedoption = 1;
			}
			this.filterData(this.selectedoption, this.searchText, false);
			this.loadSearchCriteria();
		}
	}

	ResetChanges() {
		this.myForm.resetForm();
		this.idToUpdate = null
		this.highlightedRows.pop();
		this.isValid = true;
		this.SetStateChanges(false);
		this.isInUse = false;
		this.currentRowIndex = -1;
		this.setSaveBtnEnable();
		this.setFocus();
	}
	// search data in table.
	public doFilter(selectedVal: number, filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterData(selectedVal, filterValue, true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() == "") || filterValue == "" || filterValue == null || filterValue == undefined) {

			this.searchText = "";
			this.filterData(this.selectedoption, this.searchText, false);
		}

	}

	filterData(selectedVal: number, filterValue: string, localStorageFlag) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: any) => {
			if (selectedVal == 1) {
				if (this.validateWildCardType(data.stateCode.toLowerCase(), filterValue.toLowerCase())) {
					return data.stateCode;
				}
			}
			else if (selectedVal == 2) {
				if (this.validateWildCardType(data.stateName.toLowerCase(), filterValue.toLowerCase())) {
					return data.stateName;
				}
			}
		}
		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;

		//storing search criteria to local storage.
		if (localStorageFlag) {
			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.statesSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				searchCriteriaObj.push({ screenName: Constants.statesSubmenu, searchBy: selectedVal });
			}
			else {
				searchCriteriaObj[index].searchBy = selectedVal;
			}
			localStorage.setItem("searchCriteriaObj", JSON.stringify(searchCriteriaObj));
		}

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


	// validation for duplicate state code.
	ValidateState() {
		const state = this.statesForm.value;
		var dataChanged = false;
		if (this.highlightedRows.length > 0) {
			if (this.highlightedRows[0].stateCode === state.stateCode && this.highlightedRows[0].stateName === state.stateName) {
				dataChanged = true;
			}
			else {
				dataChanged = false;
			}
		}
		else {
			if (this.idToUpdate == null && (((state.stateCode != "" && state.stateCode != null) || (state.stateName != "" && state.stateName != null)))) {
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
		if (!this.ValidateState()) {
			if (this.idToUpdate != row.stateID) {
				if (await this.checkDataChange()) {
					this.loadStateToEdit(row);
				}
			}
		}
		else {
			this.loadStateToEdit(row);
		}
	}

	async checkDataChange() {
		let state = this.statesForm.value;
		if (this.idToUpdate != null) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.isChangesExists = false;
				return true;
			}
		}
		else {
			if (this.idToUpdate == null && (((state.stateCode != "" && state.stateCode != null) || (state.stateName != "" && state.stateName != null)))) {
				const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (userresponse === "ok") {
					this.isChangesExists = false;
					return true;
				}
			}
			else {
				return true;
			}
		}

	}
	//load state data to display on fields.
	loadStateToEdit(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.setFocus();
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.SetStateChanges(false);
		this.idToUpdate = row.stateID;
		this.statesForm.controls['stateName'].setValue(row.stateName);
		this.statesForm.controls['stateCode'].setValue(row.stateCode);
		this.setSaveBtnEnable();
	}

	// to save new state.
	async createState(state: States) {
		this.stateService.createState(state).subscribe(
			() => {
				this.saveData()
			},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "States", "check_circle", false);
		this.loadAllStates();
		this.fromSave = true;
		this.ResetChanges();
	}

	// to update state.
	async updateState(state: States) {
		state.stateID = this.idToUpdate;
		this.stateService.updateState(state).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "States", "check_circle", false);
			this.idToUpdate = null;
			this.isstateCodechanged = false;
			this.isChangesExists = false;
			this.loadAllStates();
			this.loadStateToEdit(this.dataSource.data[this.currentRowIndex]);
			//this.ResetChanges();
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	// to delete state.
	async deleteState(id: number) {
		if(!this.ValidateState()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedState(id);				
			}
		}
		else{
			this.deleteSelectedState(id);	
		}    
	}

	async deleteSelectedState(id:number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.stateService.deleteState(id).subscribe(
			result => {
				if (result.message === MessageConstants.RECORDINUSE) {
					this.popupService.openAlertDialog(MessageConstants.STATE_RECORDINUSE, "States", "check_circle");
				}
				else {
					this.deleteData();
				}
			},
			(error) => {
				this.errorService.handleError(error);
			});
		}
	}

	async deleteData() {
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "States", "check_circle", false);
		this.loadAllStates();
		this.idToUpdate = null;
		this.ResetChanges();
	}

	//Form field change event.
	isChange() {
		this.isChangesExists = true;
		this.isstateCodechanged = true;
	}

	SetStateChanges(value: boolean) {
		this.isstateCodechanged = value;
		this.isChangesExists = value;
	}

	//validation to allow only alphabets.
	allowAlphabetsOnly(event) {
		if (event.charCode == 32 || (event.charCode >= 97 && event.charCode <= 122) || (event.charCode >= 65 && event.charCode <= 90))
			return true;
		else
			return false;
	}

	 //Dirty flag validation on page leave.
	 @HostListener('window:onhashchange')
	 canDeactivate(): Observable<boolean> | boolean {
	 return this.ValidateState();
   }
}




