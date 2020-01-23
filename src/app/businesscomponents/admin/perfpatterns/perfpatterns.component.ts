import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource, MatInput } from '@angular/material';
import { Perfpatterns } from '../../../businessclasses/admin/perfpatterns';
import { PerfpatternsService } from '../../../businessservices/admin/perfpatterns.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { Constants } from '@/app.constants';
import { UserPrivilegesService } from '@/_services';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-perfpatterns',
	templateUrl: './perfpatterns.component.html',
	styleUrls: ['./perfpatterns.component.css']
})
export class PerfpatternsComponent implements OnInit {

	//variable declarations.
	perfPatternForm: FormGroup;
	perfpatternsToUpdate = null;
	highlightedRows = [];
	// search no data found
	isTableHasData = true;
	searchText: string;
	isChangesExists: boolean = false;
	isDescriptionChanged: boolean = false;
	errorMatcher = new ErrorMatcher();
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	ifPerfPatternCodeDisabled: boolean = true;
	tableColumns: string[] = [ 'description'];
	dataSource = new MatTableDataSource<Perfpatterns>();
	allperfPatterns: Observable<Perfpatterns[]>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatInput) clearText: MatInput;
	//to set foucs 
	@ViewChild('perfpattern') perfpattern: ElementRef;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	isValid: boolean = true;
	result: any;
	@ViewChild('f') myForm;
	@ViewChild('filterText') filterText: ElementRef;
	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;
	isInUse: boolean = false;
	currentRowIndex: number = -1;
	fromSave: boolean = false;
	isExistInSession = false;
	constructor(private formbulider: FormBuilder,
		private perfpatternsService: PerfpatternsService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService
	) {
		//Set Perf Pattern screen privileges
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
		this.perfPatternForm = this.formbulider.group({
		//	perfPattern: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(2)]],
			description: ['', [Validators.required, Validators.maxLength(50), SpaceValidator.ValidateSpaces]]
		});
		this.loadAllperfPatterns();
		this.loadSearchCriteria();
		//this.dataSource.sortingDataAccessor = (data, sortHeaderId) => data[sortHeaderId].toLocaleLowerCase();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};

		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['description', 'delete']
		}
		this.setFocus();
		this.setSaveBtnEnable();
	}

	//to enable or disable save button based on privilege.
	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.perfpatternsToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.perfpatternsToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	//to set focus.
	setFocus() {
		setTimeout(() => {
			this.perfpattern.nativeElement.setSelectionRange(this.perfpattern.nativeElement.value.length, this.perfpattern.nativeElement.value.length);
			this.perfpattern.nativeElement.focus();
		}, 0);
	}

	//To load perfPatterns data.
	loadAllperfPatterns() {
		this.allperfPatterns = this.perfpatternsService.getAllPerfPatterns(true);
		this.allperfPatterns.subscribe(results => {
			if (!results) { return };
			this.dataSource.data = results;
			this.dataSource.sort = this.sort;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
			if (this.currentRowIndex >= 0) {
				this.selectRow(this.dataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//search options
	public searchOptions = [
		{ "id": 1, "name": "Code" },
		{ "id": 2, "name": "Description" }

	];

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
		const perfPattern = this.perfPatternForm.value;
		if (this.isChangesExists || this.isDescriptionChanged) {
			this.result = this.ValidatePerfPattern(perfPattern);
			if (this.result) {
				if (this.perfpatternsToUpdate == null)
					this.createPerfPattern(perfPattern);
				else if (this.perfpatternsToUpdate != null && this.isChangesExists)
					this.updatePerPattern(perfPattern);
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Perforation Patterns", "check_circle", false);
		}
	}

	//load search criteria from local storage.
	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.perforationPatternsSubmenu) : -1;
		if (index == -1) {
			this.isExistInSession = false;
		}
		else {
			this.isExistInSession = true;
		}
	}

	isChange() {
		this.isChangesExists = true;
		this.isDescriptionChanged = true;
	}

	// validation for duplicate entries in description.
	ValidatePerfPattern(perfPatternType: Perfpatterns): boolean {
		this.isValid = true;
		this.dataSource.data.forEach(item => {
			if (this.perfpatternsToUpdate == null) {
				if (item.description.toLowerCase().trim() == perfPatternType.description.toLowerCase().trim()) {
					this.isValid = false;
				}
			}
			else {
				if (item.perfPattern != this.perfpatternsToUpdate) {
					if (item.description.toLowerCase().trim() === perfPatternType.description.toLowerCase().trim()) {
						this.isValid = false;
					}
				}
				else {
					if (item.description.trim() === perfPatternType.description.trim()) {
						this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Perforation Patterns", "check_circle", false);
						this.isChangesExists = false;
						return this.isValid;
					}
				}
			}
		});
		if (!this.isValid) {
			this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Perforation Patterns", "check_circle", false);
			return this.isValid;
		}
		return this.isValid;
	}

	// To highlight selected row in the grid.
	async selectRow(row) {
		if (this.checkData()) {
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.populateData(row);
			}
		}
		else {
			this.isChangesExists = false;
			this.populateData(row);
		}

	}
	//to check data change.
	checkData() {
		const perfPattern: Perfpatterns = this.perfPatternForm.value;
		let changesExist = false;
		if (this.isChangesExists) {
			if (this.perfpatternsToUpdate == null) {
				if ((perfPattern.description && perfPattern.description.trim() != '') || perfPattern.perfPattern.toLocaleString().length > 0) {
					changesExist = true;
				}
			}
			else {
				for (let i = 0; i < this.dataSource.data.length; i++) {
					if (this.dataSource.data[i].perfPattern == this.perfpatternsToUpdate) {
						if (this.dataSource.data[i].description != perfPattern.description) {
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

	populateData(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.setFocus();
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.loadperfPatternToEdit(row);
	}

	//PerfPattern data display in text fields.
	loadperfPatternToEdit(row) {
		this.perfpatternsToUpdate = row.perfPattern;
		this.perfPatternForm.controls['description'].setValue(row.description);
		this.setSaveBtnEnable();
	}

	//To save PerfPattern data.
	async createPerfPattern(perfPatternType: Perfpatterns) {
		this.perfpatternsService.createPerfPattern(perfPatternType).subscribe(
			() => {
				this.saveData();
			},
			(error) => {
				this.perfpattern.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Perforation Patterns", "check_circle", false);
		this.isChangesExists = false;
		this.fromSave = true;
		this.loadAllperfPatterns();
		this.ResetChanges();
	}

	//To update PerfPattern data.
	updatePerPattern(perfPatternType: Perfpatterns) {
		perfPatternType.perfPattern = this.perfpatternsToUpdate;
		this.perfpatternsService.updatePerfPatternType(perfPatternType).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Perforation Patterns", "check_circle", false);
			this.isChangesExists = false;
			this.loadAllperfPatterns();
			//this.ResetChanges();
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//To delete PerfPattern data.
	async deleteperfPattern(perfPattern: number) {
		if(this.checkData()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedPerfPattern(perfPattern);				
			}
		}
		else{
			this.deleteSelectedPerfPattern(perfPattern);	
		}			
	}

	async deleteSelectedPerfPattern(perfPattern: number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.perfpatternsService.deletePerfPatternType(perfPattern).subscribe(
				result => {
					if (result.message == MessageConstants.RECORDINUSE) {
						this.popupService.openAlertDialog(MessageConstants.PERFPATTERN_RECORDINUSE, "Perforation Patterns", "check_circle", true);
					}
					else {
						this.deleteData();
					}
				},
				(error) => {
					this.errorService.handleError(error);
				},
			);
		}
	}

	async deleteData() {
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Perforation Patterns", "check_circle", false);
		this.loadAllperfPatterns();
		this.ResetChanges();
	}


	//	To Clear form data.
	async resetForm() {
		if (this.checkData()) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (userresponse === "ok") {
				this.ResetChanges();
				this.searchText = "";
				if (!this.isExistInSession) {
					this.selectedoption = 1;
				}
				this.filterDataSource(this.searchText, false);
				this.loadSearchCriteria();

			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			if (!this.isExistInSession) {
				this.selectedoption = 1;
			}
			this.filterDataSource(this.searchText, false);
			this.loadSearchCriteria();
		}
	}

	//to reset data.
	ResetChanges() {
		this.myForm.resetForm();
		this.highlightedRows.pop();
		this.perfpatternsToUpdate = null;
		this.isChangesExists = false;
		this.currentRowIndex = -1;
		this.isInUse = false;
		this.setFocus();
		this.setSaveBtnEnable();
	}


	// search elements in table. 
	public doFilter(filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterDataSource(filterValue, true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() == "") || filterValue == "" || filterValue == null || filterValue == undefined) {

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
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.perforationPatternsSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				//searchCriteriaObj.push({ screenName: Constants.perforationPatternsSubmenu, searchBy: selectedVal });
			}
			else {
			//	searchCriteriaObj[index].searchBy = selectedVal;
			}
			localStorage.setItem("searchCriteriaObj", JSON.stringify(searchCriteriaObj));
		}

	}
	//Validates the wild card search. 
	validateWildCardType(str, rule) {
		var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
	}

	//to omit speical characters.
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

	// To Show Validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.perfPatternForm.controls[controlName].hasError(errorName);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
		canDeactivate(): Observable<boolean> | boolean {
		
		return !this.checkData();
	}
}
