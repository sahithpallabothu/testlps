//Angular Components.
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';

//Services
import { DepartmentService } from '../../../businessservices/admin/department.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { UserPrivilegesService } from '@/_services';

//Bussiness Class
import { Department } from '../../../businessclasses/admin/department';

//Constants
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-department',
	templateUrl: './department.component.html',
	styleUrls: ['./department.component.css']
})

export class DepartmentComponent implements OnInit {

	// Variable declaration.
	isTableHasData = true;
	selectedRow: Number = 0;
	departmentArray: Department[];
	searchText: string;
	departmentForm: FormGroup;
	isValid: boolean = true;
	isChangesExists: boolean = false;
	isDataChanged: boolean = false;
	result: any;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	public index: number;
	//  to apply sorting for Mat Table.
	@ViewChild(MatSort) sort: MatSort;
	// Table declarations
	tableColumns: string[] = ['name', 'description','active'];
	departmentDataSource = new MatTableDataSource<Department>();
	highlightedRows = [];
	allDepartments: Observable<Department[]>;
	recIdToUpdate = null;
	errorMatcher = new ErrorMatcher();
	//to set foucs.
	@ViewChild('departmentName') departmentName: ElementRef;
	@ViewChild('f') myForm;
	@ViewChild('filterText') filterText: ElementRef;
	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave : boolean = false; 
	isInUse : boolean = false;
	currentRowIndex : number = -1;
	fromSave : boolean = false;
	isExistInSession = false;
	constructor(
		private formbulider: FormBuilder,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private DepartmentService: DepartmentService,
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
		}
	}

	ngOnInit() {
		this.departmentForm = this.formbulider.group({
			Name: ['', [Validators.required,SpaceValidator.ValidateSpaces]],
			description: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			active: ['true', []]
		});
		this.loadAllDepartments();
		this.loadSearchCriteria();
		this.departmentDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};

		this.setFocus();
		this.setSaveBtnEnable();
		if(this.hasScreenDeletePriviledge){
			this.tableColumns = ['name', 'description','active','delete'];
		}
	}


   //to enable or disable save button based on privilege.
	setSaveBtnEnable(){
		if(this.hasScreenInsertPriviledge && this.recIdToUpdate == null ){
			this.isAllowSave=true;
		  }else if(this.hasScreenUpdatePriviledge && this.recIdToUpdate !== null ){
			this.isAllowSave=true;
		  }
		  else{
			this.isAllowSave=false;
		  }
	 
	}

	//to set focus.
	setFocus() {
		setTimeout(() => {
			this.departmentName.nativeElement.setSelectionRange(this.departmentName.nativeElement.value.length, this.departmentName.nativeElement.value.length);
			this.departmentName.nativeElement.focus();
		}, 0);
	}

	//search dropdown options.
	public searchOptions = [
		{ "id": 1, "name": "Department" },
		{ "id": 2, "name": "Description" },
	];

	//to check the filter dropdown value.
	public selectedoption = 1;
	checkFilterBySelected() {
		this.searchText = "";
		this.setSearchTextFocus();
	}

	//to set focus for search text.
	setSearchTextFocus(){
		setTimeout(() => {
			this.filterText.nativeElement.focus();
		}, 0);
	}

	//based on given value filter the records
	public doFilter(selectedVal: number, filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterDataSource(selectedVal, filterValue, true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() == "" )||  filterValue == ""|| filterValue == null || filterValue == undefined) {
			this.searchText = "";
			this.filterDataSource(this.selectedoption, this.searchText, false);
		}
	}

	//to filter data.
	filterDataSource(selectedVal: number, filterValue: string, localStorageFlag) {
		if(filterValue.indexOf('*')==-1){
			filterValue+='*';
		}
		this.departmentDataSource.filterPredicate = (data: any, filter: string) => {
			if (selectedVal == 1) {
				if(this.validateWildCardType(data.name.toLowerCase(),filterValue.toLowerCase())){
					return data.name;
				}
			}
			else if (selectedVal == 2) {
				if(this.validateWildCardType(data.description.toLowerCase(),filterValue.toLowerCase())){
					return data.description;
				}			
			}
		}
		this.departmentDataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.departmentDataSource.filteredData.length > 0 ? true : false;

		//storing search criteria to local storage.
		if (localStorageFlag) {

			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.departmentSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				searchCriteriaObj.push({ screenName: Constants.departmentSubmenu, searchBy: selectedVal });
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


	//load all departments into table
	loadAllDepartments() {
		this.allDepartments = this.DepartmentService.getAllDepartments(true);
		this.allDepartments.subscribe(results => {
			if (!results) { return };
			this.departmentArray = results;
			this.departmentDataSource.data = this.departmentArray;
			this.departmentDataSource.sort = this.sort;
			this.isTableHasData = this.departmentDataSource.data.length > 0 ? true : false;
			if (this.currentRowIndex >= 0) {
				this.populateData(this.departmentDataSource.data[this.currentRowIndex])
			}

		},
			(error) => {
				this.errorService.handleError(error);
			});


	}

	// Save Department Data.
	async saveDepartmentData(oDepartment: Department) {
		this.DepartmentService.createDepartment(oDepartment).subscribe(() => {
			this.saveData();
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	// Save Department Data functionality.
	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Department", "check_circle", false);
		this.fromSave = true;
		this.loadAllDepartments();
		this.isChangesExists = false;
		this.isDataChanged = false;
		this.ResetChanges();
	}


	//load search criteria from local storage.
	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.departmentSubmenu) : -1;
		if (index == -1) {
			this.selectedoption = 1;
			this.isExistInSession = false;
		}
		else {
			this.selectedoption = searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}


	isDeptChange() {
		this.isDataChanged = true;
	}

	//collect all form values on submit click
	onFormSubmit() {
		const department = this.departmentForm.value;
		this.isDataChanged = false;
		this.departmentDataSource.data.forEach(item => {
			if (item.deptID != this.recIdToUpdate) {
				if (item.name.toLowerCase().trim() === department.Name.toLowerCase().trim()) {
					this.isDataChanged = true;
				}
			}
		});

		if (!this.ValidateDepartment() && !this.isDataChanged) {
			if (this.recIdToUpdate == null)
				this.saveDepartmentData(department);
			else if (this.recIdToUpdate != null) {
				this.updateDepartmentData(department);
			}

		}
		else {
			if (this.isDataChanged) {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Department", "check_circle", false);
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Department", "check_circle", false);
			}
		}
	}

	// validation for duplicate department Name.
	ValidateDepartment() {
		const department = this.departmentForm.value;
		var dataChanged = false;
		if (this.highlightedRows.length > 0) {
			if (this.highlightedRows[0].name === department.Name && this.highlightedRows[0].description === department.description &&
				this.highlightedRows[0].active === department.active) {
				dataChanged = true;
			}
			else {
				dataChanged = false;
			}
		}
		else {
			if (this.recIdToUpdate == null && ((department.Name != "" && department.Name != null) || (department.description != "" && department.description != null)||(!department.active))) {
				dataChanged = false;
			}
			else{
				dataChanged = true;
			}
		}
		return dataChanged;
	}

	// to update department data.
	loadDepartmentToEdit(row: any) {
		this.recIdToUpdate = row.deptID;
		this.departmentForm.controls['Name'].setValue(row.name);
		this.departmentForm.controls['description'].setValue(row.description);
		this.departmentForm.controls['active'].setValue(row.active);
		this.setSaveBtnEnable();
	}

	//Form field change event.
	isChange() {
		this.isChangesExists = true;
	}

	//to populate data.
	populateData(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.departmentDataSource.data.indexOf(row);
		this.setFocus();
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.loadDepartmentToEdit(row);
	}


	//to show color of selected row and load into text fields
	async selectRow(row) {
		if (!this.ValidateDepartment()) {
			if (this.recIdToUpdate != row.deptID) {
				if (await this.checkDataChange()) {
					this.populateData(row);
				}
			}
		}
		else {
			this.populateData(row);
		}
	}

	//to check data change in controls.
	async checkDataChange() {
		let department = this.departmentForm.value;
		if (this.recIdToUpdate != null) {
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (resetResponse === "ok") {
				return true;
			}
		}
		else {
			if (this.recIdToUpdate == null && ((department.Name != null && department.Name.length > 0) || (department.description != null && department.description.length > 0) || (department.active === false))) {
				let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (resetResponse === "ok") {
					return true;
				}
			}
			else {
				return true;
			}

		}
	}

	//to validate the errors 
	public hasError = (controlName: string, errorName: string) => {
		return this.departmentForm.controls[controlName].hasError(errorName);
	}

	//delete the record

	async deleteDepartment(RecID: number) {
		if(!this.ValidateDepartment()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedDepartment(RecID);				
			}
		}
		else{
			this.deleteSelectedDepartment(RecID);
		}	
	
	}

	async deleteSelectedDepartment(RecID: number){
		let userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.DepartmentService.deleteDepartmenteById(RecID).subscribe(result => {
				if (result.message[0] == MessageConstants.RECORDINUSE) {
					// this.popupService.openAlertDialog(MessageConstants.DEPARTMENT_RECORDINUSE, "Department", "check_circle");
					this.popupService.openAlertDialog(MessageConstants.DEPARTMENT_RECORDINUSE, "Department", "check_circle", true, result.message[1], this.isInUse, "Users");
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

	async deleteData(){
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Department", "check_circle", false);
		this.loadAllDepartments();
		this.ResetChanges();
	}

	// Update Department Data.
	updateDepartmentData(department: Department) {
		department.deptID = this.recIdToUpdate;
		this.DepartmentService.updateDepartment(department).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Department", "check_circle", false);
			this.recIdToUpdate = null;
			this.isDataChanged = false;
			this.isChangesExists = false;
			this.loadAllDepartments();
			this.populateData(this.departmentDataSource.data[this.currentRowIndex]);
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	// To clear form data.
	async resetForm() {
		if (!this.ValidateDepartment()) {
			if (await this.checkDataChange()) {
				this.ResetChanges();
				this.searchText = "";
				if (!this.isExistInSession) {
					this.selectedoption = 1;
				}
				this.filterDataSource(this.selectedoption, this.searchText, false);
				this.loadSearchCriteria();
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			if (!this.isExistInSession) {
				this.selectedoption = 1;
			}
			this.filterDataSource(this.selectedoption, this.searchText, false);
			this.loadSearchCriteria();
			}
		}

	//clear form and reset all intialized variables
	ResetChanges() {
		this.highlightedRows.pop();
		this.myForm.resetForm();
		this.isDataChanged = false;
		this.isChangesExists = false;
		this.recIdToUpdate = null;
		this.departmentForm.controls["active"].setValue(true);
		this.setSaveBtnEnable();
		this.currentRowIndex = -1;
		this.isInUse = false;
		this.setFocus();
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return this.ValidateDepartment();
	}
}
