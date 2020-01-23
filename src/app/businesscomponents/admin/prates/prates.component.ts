import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, ElementRef, TemplateRef, ɵConsole } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
//angular material components.
import { MatSort, MatTableDataSource, MatPaginator, MatRadioButton, MatRadioGroup, ErrorStateMatcher } from '@angular/material';
//business components.
import { Prates } from '../../../businessclasses/admin/prates';
import { PratesService } from '../../../businessservices/admin/prates.service';
// popup-message services.
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
import { DatePipe,DecimalPipe } from '@angular/common';
import { CustomDateConvertor } from '@/shared/customDateConvertor';

@Component({
	selector: 'app-prates',
	templateUrl: './prates.component.html',
	styleUrls: ['./prates.component.css']
})

export class PratesComponent implements OnInit {
	// variable declarations.
	prateForm: FormGroup;
	IdToUpdate = null;

	//to set foucs. 
	@ViewChild('typeCode') typeCode: ElementRef;
	@ViewChild('filterText') filterText: ElementRef;
	searchText: string;
	ifFilterBySelected = true;
	isValid: boolean = true;
	result: any;
	isChangesExists: boolean = false;
	istypeCodeChanged: boolean = false;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

	//table declarations.	
	tableColumns: string[] = ['typeCode','startDate', 'rate', 'displayOrder', 'description','active'];//,'update'
	dataSource = new MatTableDataSource<Prates>();
	allPrates: Observable<Prates[]>;
	highlightedRows = [];
	isTableHasData = true;
	@ViewChild(MatSort) sort: MatSort;
	errorMatcher = new ErrorMatcher();
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;

	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;

	isAllowSave: boolean = false;
	fromSave: boolean = false;
	currentRowIndex = -1;
	isExistInSession = false;

	dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	@ViewChild('f') myForm;
	startOfEndDate = new Date();
	constructor(private formbulider: FormBuilder,
		private prateService: PratesService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
		public datepipe: DatePipe,
		private dp: DecimalPipe,
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
		this.prateForm = this.formbulider.group({
			startDate: [, [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			startDateWithPicker: [, []],
			typeCode: ['', [Validators.required]],
			rate: ['', [ Validators.required]],
			description: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			displayOrder: ['', [Validators.pattern(/^[0-9]+$/)]],
			active: ['', []],
		});
		this.loadAllPRates();
		this.loadSearchCriteria();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): any => {
			if(sortHeaderId =='startDate'){
				return new Date(data.startDate);
			}
			if (typeof data[sortHeaderId] === 'string') {
				if (sortHeaderId === 'rate' || sortHeaderId === 'displayOrder') {
					data[sortHeaderId] = +data[sortHeaderId];
					return data[sortHeaderId];
				} 

				 else {
					return data[sortHeaderId].toLocaleLowerCase();
				} 
			}
			return data[sortHeaderId];


		};

		this.setFocus();
		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['typeCode','startDate', 'rate', 'displayOrder', 'description','active', 'delete'];
		}
		this.setSaveBtnEnable();
	}

	setFocus() {
		setTimeout(() => {
			this.typeCode.nativeElement.setSelectionRange(this.typeCode.nativeElement.value.length, this.typeCode.nativeElement.value.length);
			this.typeCode.nativeElement.focus();
		}, 0);
	}

	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.PostageRatesSubmenu) : -1;
		if (index == -1) {
			this.selectedoption = 5;
			this.isExistInSession = false;
		}
		else {
			this.selectedoption = searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}



	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.IdToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.IdToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	// form hasError validation.
	public hasError = (controlName: string, errorName: string) => {
		return this.prateForm.controls[controlName].hasError(errorName);
	}

	// dropDown searchOptions.
	public searchOptions = [
	
		{ "id": 5, "name": "Type Code" },
		{ "id": 1, "name": "Start Date" },
		{ "id": 4, "name": "Rate" },
		{ "id": 3, "name": "Display Order" },
		{ "id": 2, "name": "Description" },
	]
	public selectedoption = -1;

	// Is change search by options. 
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


	//load All pRatess.
	loadAllPRates() {
		this.allPrates = this.prateService.getAllPrates();
		this.allPrates.subscribe(results => {
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

	//on Form Data Submit.
	onFormSubmit() {
		const prate = this.prateForm.value;
		prate.startDate =  this.datepipe.transform(prate.startDate,'MM/dd/yyyy');
		prate.rate= +(String(prate.rate).replace(/,/g, ''));
		prate.typeCode = +(prate.typeCode);
		prate.active = prate.active ==1 ?prate.active:0;
		if (this.isChangesExists || this.istypeCodeChanged) {
			this.result = this.ValidatepRate(prate);
			if (this.result) {
				if (this.IdToUpdate == null) {
					this.createPRate(prate);
				}
				else if (this.IdToUpdate != null && (this.isChangesExists || this.istypeCodeChanged)) {
					this.updatePRate(prate);
				}
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, " Postage Rates", "check_circle", false);
		}
	}
	// validation for duplicate rate type.
	ValidatepRate(pRates: any): boolean {
		this.isValid = true;
		this.dataSource.data.forEach(item => {
			item.startDate = this.datepipe.transform(item.startDate, "MM/dd/yyyy");
			if (this.IdToUpdate == null) {
				if (item.description.toLowerCase() === pRates.description.toLowerCase() && item.startDate === pRates.startDate && item.typeCode === pRates.typeCode && item.active == pRates.active) {
					this.isValid = false;
				}
			}
			else {

				if (item.postalTypeID != this.IdToUpdate) {

					if (item.description.toLowerCase() === pRates.description.toLowerCase() && item.startDate === pRates.startDate && item.typeCode === pRates.typeCode && item.active == pRates.active) {
						this.isValid = false;
					}
				}
				else {
			
					if (item.description.trim() === pRates.description.trim() &&
						item.rate === +pRates.rate &&
						item.displayOrder === +pRates.displayOrder
						&& item.typeCode === +pRates.typeCode
						&& this.datepipe.transform(item.startDate, "MM/dd/yy") === this.datepipe.transform(pRates.startDate, "MM/dd/yy")
						&& item.active === pRates.active
					) {
						this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, " Postage Rates", "check_circle", false);
						this.isChangesExists = false;
						return this.isValid;
					}
				}
			}

		});

		if (!this.isValid) {
			this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, " Postage Rates", "check_circle", false);
			return this.isValid;
		}
		return this.isValid;
	}

	checkDataChange() {
		const pRates: Prates = this.prateForm.value;
		let changesExist = false;
		if (this.isChangesExists) {
			if (this.IdToUpdate == null) {
				if ((pRates.postalTypeID && pRates.postalTypeID != null) || (pRates.description && pRates.description != '') || (pRates.rate && pRates.rate != null) || (pRates.displayOrder && pRates.displayOrder != null) || (pRates.typeCode && pRates.typeCode != null)|| (pRates.startDate && pRates.startDate != null)|| (pRates.active!=true)) {
					changesExist = true
				}
			}
			else {
				for (let i = 0; i < this.dataSource.data.length; i++) {
					if (this.dataSource.data[i].postalTypeID == this.IdToUpdate) {
						pRates.rate = +(String(pRates.rate).replace(/,/g, ''))
						console.log(this.dataSource.data[i],'this.dataSource.data[i]')
						console.log(pRates,'pRates')
						if (this.dataSource.data[i].description != pRates.description ||
							this.dataSource.data[i].displayOrder != +pRates.displayOrder ||
							this.dataSource.data[i].rate != pRates.rate||
							this.dataSource.data[i].typeCode != +pRates.typeCode ||
							this.datepipe.transform(this.dataSource.data[i].startDate, "MM/dd/yy") != pRates.startDate ||
							this.dataSource.data[i].active !=pRates.active) {
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


	//reset Form.
	async resetForm() {

		if (this.checkDataChange()) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.ResetChanges();
				this.searchText = "";
				if (!this.isExistInSession) {
					this.selectedoption = 5;
				}
				this.filterDataSource(this.selectedoption, this.searchText, false);
				this.loadSearchCriteria();
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			if (!this.isExistInSession) {
				this.selectedoption = 5;
			}
			this.filterDataSource(this.selectedoption, this.searchText, false);
			this.loadSearchCriteria();
		}
	}

	ResetChanges() {
		this.myForm.resetForm();
		this.IdToUpdate = null;
		this.highlightedRows.pop();
		this.isChangesExists = false;
		this.isValid = true;
		this.istypeCodeChanged = false;
		this.currentRowIndex = -1;
		this.ifFilterBySelected = true;
		this.setSaveBtnEnable();
		this.setFocus();
	}


	// search elements in table .
	public doFilter(selectedVal: number, filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterDataSource(selectedVal, filterValue, true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() == "") || filterValue == "" || filterValue == null || filterValue == undefined) {
			this.searchText = "";
			this.filterDataSource(this.selectedoption, this.searchText, false);
		}
		else {
			this.popupService.openAlertDialog("Please enter Search By and Search Text.", "Postage Rates", "check_circle", false);
		}

	}

	filterDataSource(selectedVal: number, filterValue: string, localStorageFlag) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: any) => {
			if (selectedVal == 1) {
				var date = this.datepipe.transform(data.startDate, "MM/dd/yy")
				
				if (this.validateWildCardType(date, filterValue.toString())) {
					return data.startDate;
				}
			}
			else if (selectedVal == 2) {
				if (this.validateWildCardType(data.description.toLowerCase(), filterValue.toLowerCase())) {
					return data.description;
				}
			}
			else if (selectedVal == 3) {
				if (this.validateWildCardType(data.displayOrder, filterValue.toLowerCase())) {
					return data.displayOrder;
				}
			}

			else if (selectedVal == 4) {
				if (this.validateWildCardType(data.rate, filterValue.toLowerCase())) {
					return data.rate;
				}
			}

			else if (selectedVal == 5) {
				if (this.validateWildCardType(data.typeCode, filterValue.toLowerCase())) {
					return data.typeCode;
				}
			}
		}
		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;

		//storing search criteria to local storage.
		if (localStorageFlag) {
			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.PostageRatesSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				searchCriteriaObj.push({ screenName: Constants.PostageRatesSubmenu, searchBy: selectedVal });
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


	// form fields text changes.
	isChange() {
		this.isChangesExists = true;
	}

	// rate type text change.  
	typeCodeChanged() {
		this.istypeCodeChanged = true;
	}

	//selected row for highlight.
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
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.isChangesExists = false;
		this.istypeCodeChanged = false;
		this.loadPRatesToEdit(row);
	}

	//load PRate data to display on fields.
	loadPRatesToEdit(row) {
		this.IdToUpdate = row.postalTypeID;
		this.prateForm.controls['typeCode'].setValue(row.typeCode);
		this.prateForm.controls['rate'].setValue(row.rate == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(row.rate, '1.4-4'));
		this.prateForm.controls['description'].setValue(row.description);
		this.prateForm.controls['displayOrder'].setValue(row.displayOrder);
		this.prateForm.controls['startDate'].setValue(this.convertToCustomDate(row.startDate));
		this.prateForm.controls['startDateWithPicker'].setValue(new Date(row.startDate));
		this.prateForm.controls['active'].setValue(row.active);
		this.setSaveBtnEnable();
	}

	//create new PRate.
	async createPRate(pRates: Prates) {
		this.prateService.createPrate(pRates).subscribe(res => {
			this.saveDataMsg();

		},
			(error) => {

				this.errorService.handleError(error);
			});
	}

	async saveDataMsg() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, " Postage Rates", "check_circle", false);
		this.fromSave = true;
		this.loadAllPRates();
		this.ResetChanges();
	}

	//update existed PRate.
	async updatePRate(pRates: Prates) {
		pRates.postalTypeID = this.IdToUpdate;
		this.prateService.updatePrates(pRates).subscribe(res => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, " Postage Rates", "check_circle", false);
			this.isChangesExists = false;
			this.loadAllPRates();
			//this.ResetChanges();
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//delete PRate.
	async deletePRate(postalTypeID: number) {
		if(this.checkDataChange()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedPRate(postalTypeID);				
			}
		}
		else{
			this.deleteSelectedPRate(postalTypeID);	
		}
	}

	async deleteSelectedPRate(postalTypeID:number){
		const user_response = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (user_response === "ok") {
			this.prateService.deletePrate(postalTypeID).subscribe(() => {
				this.deleteFunctionality();
			},
				(error) => {
					this.errorService.handleError(error);
				});
		}
	}

	async deleteFunctionality() {
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, " Postage Rates", "check_circle", false);
		this.loadAllPRates();
		this.ResetChanges();
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
		return !this.checkDataChange() ;
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

	//Set end date to datepicker.
	setDateInDatePicker(controlName1, controlName2) {
		this.isChangesExists = true;
		let dateToSet: any = new Date(this.prateForm.controls[controlName1].value);
		if (dateToSet == "Invalid Date" || this.prateForm.controls[controlName1].value == null || this.prateForm.controls[controlName1].value == ""){/*  || dateToSet<this.homeScreenForm.get('startDate').value */
			this.prateForm.controls[controlName2].setValue("");
		}
		else{
			let date = CustomDateConvertor.dateConvertor(this.startOfEndDate); 
			if(new Date(date)>new Date(dateToSet)){
				this.prateForm.controls['startDate'].setErrors({'incorrect': true});	
			}
			else{
				this.prateForm.controls[controlName2].setValue(dateToSet);
				let date = this.datepipe.transform(this.prateForm.controls[controlName2].value,MessageConstants.DATEFORMAT).toString();
				this.prateForm.controls[controlName1].setValue(date);
			}
			
		}
		
	}

	//Set start date to control.
	addStartEvent(event) {
		this.isChangesExists = true;
		var todaysDate = new Date(this.prateForm.controls['startDateWithPicker'].value);
		let currentDate = this.datepipe.transform(todaysDate,MessageConstants.DATEFORMAT).toString();
		this.prateForm.controls['startDate'].setValue(currentDate);
	}

	convertToCustomDate(pDate){
		return CustomDateConvertor.dateConvertor(pDate);
	}

	//To validate Amount fields.
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
			if(inputData!= "" && inputData!=null ){
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
				if(inputData=='' ){
						if ((keycode == 46 && inputData.indexOf('.') == -1)) {
							return true;
						}
						else if (keycode < 48 || keycode > 57) {
							return false;
						}
				}
			}
			
		  }


	  //To change amount data to required pattern.
	  changeToAmount(controlName: string) {
		let ctrlVal = (String(this.prateForm.controls[controlName].value).replace(/,/g, ''));
		if (this.prateForm.controls[controlName].value != null && this.prateForm.controls[controlName].value != "" && ctrlVal != '.' && (+ctrlVal)>0) {
			this.prateForm.controls[controlName].setValue(this.dp.transform(+ctrlVal, '1.4-4'));
		  }
		else {
		  this.prateForm.controls['rate'].setErrors({'incorrect': true});
		}
	  }

}//component ends here.

