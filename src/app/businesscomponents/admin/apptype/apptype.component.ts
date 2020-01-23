import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Apptype } from '../../../businessclasses/admin/apptype';
import { ApptypeService } from '../../../businessservices/admin/apptype.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-apptype',
	templateUrl: './apptype.component.html',
	styleUrls: ['./apptype.component.css']
})
export class ApptypeComponent implements OnInit {

	// variable declarations.
	ApptypeForm: FormGroup;
	public index: Number;
	isValid: boolean = true;
	afterValidation: any;
	isChangesExists: boolean = false;
	isDataChanged: boolean = false;
	searchText: string;
	apptypeIdToUpdate = null;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	isInUse: boolean = false;
	// table declarations.
	tableColumns: string[] = ['appID', 'description', 'sedcRateNumber', 'active'];
	dataSource = new MatTableDataSource<Apptype>();
	highlightedRows = [];
	allApptypes: Observable<Apptype[]>;
	fromSave: boolean = false;
	currentRowIndex = -1;

	// search no data found.
	isTableHasData = true;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	 errorMatcher = new ErrorMatcher();
	//  to apply sorting for Mat Table.
	@ViewChild(MatSort) sort: MatSort;

	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;

	isAllowSave: boolean = false;
	//to set foucs.
	@ViewChild('apptypeID') apptypeID: ElementRef;
	@ViewChild('filterText') filterText: ElementRef;
	@ViewChild('f') myForm;
	isExistInSession = false;

	constructor(private formbulider: FormBuilder,
		private userPrivilegesService: UserPrivilegesService,
		private apptypeService: ApptypeService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService
	) {
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
		this.ApptypeForm = this.formbulider.group({
			description: ['', [Validators.required, Validators.maxLength(50), SpaceValidator.ValidateSpaces]],
			appID: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]+$/), Validators.maxLength(1), SpaceValidator.ValidateSpaces]],
			active: [true, []],
			sedcRateNumber: ['', [Validators.required, Validators.maxLength(50), SpaceValidator.ValidateSpaces]],
		});
		this.loadAllApptypes();
		this.loadSearchCriteria();
		this.ApptypeForm.controls['appID'].enable();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		this.setFocus();
		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['appID', 'description', 'sedcRateNumber','active', 'delete'];
		}
		this.setSaveBtnEnable();
	}

	setFocus() {
		setTimeout(() => {
			this.apptypeID.nativeElement.setSelectionRange(this.apptypeID.nativeElement.value.length, this.apptypeID.nativeElement.value.length);
			this.apptypeID.nativeElement.focus();
		}, 0);
	}

	loadSearchCriteria(){
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length>0?searchCriteriaObj.findIndex(x=>x.screenName == Constants.appTypeSubmenu):-1;
		if(index == -1){
			this.selectedoption = 1;
			this.isExistInSession = false;
		}
		else{
			this.selectedoption =searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}

	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.apptypeIdToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.apptypeIdToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	// To show validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.ApptypeForm.controls[controlName].hasError(errorName);
	}

	// to load Apptype data.
	loadAllApptypes() {
		this.allApptypes = this.apptypeService.getAllApptypes(true);
		this.allApptypes.subscribe(results => {
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

	async onFormSubmit() {
		const apptype = this.ApptypeForm.value;
		apptype.description = apptype.description.trim();
		if (this.isChangesExists) {
			this.afterValidation = await this.ValidateAppType(apptype)
			if (this.afterValidation) {
				if (this.apptypeIdToUpdate == null)
					this.saveAppTypeData(apptype);
				else if (this.apptypeIdToUpdate != null && this.isChangesExists)
					this.updateAppTypeData(apptype);
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "App Type", "check_circle", false);
		}
	}

	//search options
	public searchOptions = [
		{ "id": 1, "name": "App ID" },
		{ "id": 2, "name": "Description" }

	];

	public selectedoption = 1;

	//on change in serch by drop down
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

	// search elements in table. 
	public doFilter(selectedVal: number, filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null  &&  filterValue != undefined ) {
			this.filterDataSource(selectedVal,filterValue,true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() == "") || filterValue == "" || filterValue == null || filterValue == undefined) {
			this.searchText = "";
			this.filterDataSource(this.selectedoption, this.searchText, false);
		}
		else {
			this.popupService.openAlertDialog("Please enter Search By and Search Text.", "App Type", "check_circle", false);
		}
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

	filterDataSource(selectedVal: number, filterValue: string, localStorageFlag) {
		if(filterValue.indexOf('*')==-1){
			filterValue+='*';
		}
		this.dataSource.filterPredicate = (data: any, filter: any) => {
			if (selectedVal == 1) {
				let appID: string = data.appID;
				if (this.validateWildCardType(appID.toLowerCase(), filterValue.toLowerCase())) {
					return data.appID;
				}
			}
			else if (selectedVal == 2) {
				if (this.validateWildCardType(data.description.toLowerCase(), filterValue.toLowerCase())) {
					return data.description;
				}
			}
			else if (selectedVal == 3) {
				if (this.validateWildCardType(data.sedcRateNumber.toLowerCase(), filterValue.toLowerCase())) {
					return data.sedcRateNumber;
				}
			}
		}
		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;
		
		//storing search criteria to local storage.
		if(localStorageFlag)
		{
			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length>0?searchCriteriaObj.findIndex(x=>x.screenName == Constants.appTypeSubmenu):-1;
				if(index == -1){
				this.isExistInSession = true;
				searchCriteriaObj.push({screenName :Constants.appTypeSubmenu,searchBy: selectedVal});
			}
			else{
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

	//Form field change event.
	isChange() {
		this.isChangesExists = true;
	}

	SetAppTypeChanges(value: boolean) {
		this.isChangesExists = value;
	}

	// validation for duplicate description.
	ValidateAppType(oApptype: Apptype): boolean {
		this.isValid = true;
		this.dataSource.data.forEach(item => {
			if (this.apptypeIdToUpdate == null) {
				if (item.appID.toLowerCase().trim() === oApptype.appID.toLowerCase().trim() || item.description.toLowerCase().trim() === oApptype.description.toLowerCase().trim()) {
					this.isValid = false;
				}
			}
			else {
				if (item.appID.toLowerCase().trim() != this.apptypeIdToUpdate.toLowerCase().trim()) {		
					if (item.description.toLowerCase().trim() === oApptype.description.toLowerCase().trim()) {
						this.isValid = false;
					}
				}
				else {

					if (item.description.trim() === oApptype.description.trim() &&
						item.sedcRateNumber === oApptype.sedcRateNumber.trim() &&
						item.active === oApptype.active) {
						this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "App Type", "check_circle", false);
						this.isChangesExists = false;
						return this.isValid;
					}
				}
			}

		});

		if (!this.isValid) {
			this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "App Type", "check_circle", false);
			return this.isValid;
		}
		return this.isValid;
	}

	checkDataChange(){
		const apptype:Apptype = this.ApptypeForm.value;
		let changesExist=false;
		if(this.isChangesExists){
			if (this.apptypeIdToUpdate == null) {
				if((apptype.appID && apptype.appID!='')|| (apptype.description && apptype.description!='') || (apptype.sedcRateNumber && apptype.sedcRateNumber!='') || apptype.active!=true){
					changesExist=true
				}
			}
			else {
				for(let i=0;i<this.dataSource.data.length;i++){
					if(this.dataSource.data[i].appID==this.apptypeIdToUpdate){
						if(this.dataSource.data[i].description!=apptype.description || 
						this.dataSource.data[i].sedcRateNumber!=apptype.sedcRateNumber ||
							this.dataSource.data[i].active!=apptype.active){
								changesExist=true;
								break;
						}
					}
				}
			}
		}
		else{
			changesExist=false;
		}
		return changesExist;
	}

	// To highlight the selected row in the grid.
	async selectRow(row) {
		if (this.checkDataChange()) {
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.populateData(row);
				this.isChangesExists = false;
			}
		}
		else {
			this.populateData(row);
			this.isChangesExists = false;
		}
	}

	populateData(row) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.SetAppTypeChanges(false);
		this.loadApptypeToEdit(row);
	}

	// to update Apptype data.
	loadApptypeToEdit(row: any) {
		this.ApptypeForm.controls['appID'].disable();
		this.apptypeIdToUpdate = row.appID;
		this.ApptypeForm.controls['description'].setValue(row.description);
		this.ApptypeForm.controls['appID'].setValue(row.appID);
		this.ApptypeForm.controls['active'].setValue(row.active);
		this.ApptypeForm.controls['sedcRateNumber'].setValue(row.sedcRateNumber);
		this.setSaveBtnEnable();
	}

	// save AppType Data.
	async saveAppTypeData(oApptype: Apptype) {
		this.apptypeService.createApptype(oApptype).subscribe(() => {
			 this.saveDataMsg();	
		},
			(error) => {
				this.apptypeID.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async saveDataMsg(){
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "App Type", "check_circle", false);
		this.fromSave = true;
		this.isChangesExists = false;
		this.loadAllApptypes();
		this.ResetChanges();
	}

	// Update AppType Data.
	updateAppTypeData(oApptype: Apptype) {
		oApptype.appID = this.apptypeIdToUpdate;
		this.apptypeService.updateApptype(oApptype).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "App Type", "check_circle", false);
			this.isChangesExists = false;
			this.loadAllApptypes();
			this.ApptypeForm.controls['appID'].enable();
		},
			(error) => {
				this.apptypeID.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	// to delete Apptype data.
	async deleteApptype(appid: string) {

		if (this.checkDataChange()) {
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedAppType(appid);
				
			}
		}
		else{
			this.deleteSelectedAppType(appid);
		}
		
	}

	async deleteSelectedAppType(appid: string){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
				if (userresponse === "ok") {
					this.apptypeService.deleteApptypeById(appid).subscribe(result => {
						if (result.message[0] == MessageConstants.RECORDINUSE) {
							this.popupService.openAlertDialog(MessageConstants.APPTYPE_RECORDINUSE, "App Type", "check_circle");
						}
						else {
							this.deleteFunctionality()
						}
					},
						(error) => {
							this.errorService.handleError(error);
						});
				}
	}

	async deleteFunctionality(){
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "App Type", "check_circle", false);
		this.loadAllApptypes();
		this.ResetChanges();
		this.ApptypeForm.controls['appID'].enable();
	}

	// To clear form data.
	async resetForm() {
		if (this.checkDataChange()) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.ResetChanges();
				this.searchText = "";
				if(!this.isExistInSession){
					this.selectedoption = 1;
				}
				this.filterDataSource(this.selectedoption, this.searchText, false);
				this.loadSearchCriteria();
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			if(!this.isExistInSession){
				this.selectedoption = 1;
			}
			this.filterDataSource(this.selectedoption, this.searchText, false);
			this.loadSearchCriteria();
		}
	}

	ResetChanges() {
		this.myForm.resetForm();
		this.highlightedRows.pop();
		this.apptypeIdToUpdate = null;
		this.isValid = true;
		this.isInUse = false;
		this.SetAppTypeChanges(false);
		this.currentRowIndex = -1;
		this.ApptypeForm.controls['appID'].enable();		
		this.ApptypeForm.controls['active'].setValue(true);
		this.setSaveBtnEnable();
		this.setFocus();
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return !this.checkDataChange();
	}

}// Component ends here






