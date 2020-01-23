import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { SizeService } from '../../../businessservices/admin/size.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { Size } from '../../../businessclasses/admin/size';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-size',
	templateUrl: './size.component.html',
	styleUrls: ['./size.component.css']
})
export class SizeComponent implements OnInit {

	//variable declarations.
	highlightedRows = [];
	isTableHasData = true;
	tableColumns: string[] = ['size'];
	selectedRow: Number = 0;
	sizeDataSource = new MatTableDataSource<Size>();
	sizeArray: Size[];
	allsizes: Observable<Size[]>;
	@ViewChild(MatSort) sort: MatSort;
	sizeForm: FormGroup;
	fromSave: boolean = false;
	currentRowIndex: number = -1;
	errorMatcher = new ErrorMatcher();
	searchText: string;
	isValid: boolean = true;
	afterValidation: any;
	isChangesExists: boolean = false;
	sizeIdToUpdate = null;
	public index: number;
	isInUse: boolean = false;
	isSizeChanged: boolean = false;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;

	//to set foucs.
	@ViewChild('size') size: ElementRef;
	@ViewChild('f') myForm;
	constructor(
		private formbulider: FormBuilder,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
		private sizeService: SizeService
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
		this.sizeForm = this.formbulider.group({
			size: ['', [Validators.required, SpaceValidator.ValidateSpaces]]
		});
		this.loadAllSizes();
		this.sizeDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['size', 'delete'];
		}
		this.setFocus();
		this.setSaveBtnEnable();
	}

	setFocus() {
		setTimeout(() => {
			this.size.nativeElement.setSelectionRange(this.size.nativeElement.value.length, this.size.nativeElement.value.length);
			this.size.nativeElement.focus();
		}, 0);
	}

	//to enable or disable save button based on privilege.
	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.sizeIdToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.sizeIdToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}


	//to load data.
	loadAllSizes() {
		this.allsizes = this.sizeService.getAllSize(true);
		this.allsizes.subscribe(results => {
			if (!results) { return };
			this.sizeArray = results;
			this.sizeDataSource.data = this.sizeArray;
			this.sizeDataSource.sort = this.sort;
			this.isTableHasData = (this.sizeDataSource.data.length > 0) ? true : false;
			if (this.currentRowIndex >= 0) {
				this.selectRow(this.sizeDataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//Form field change event.
	isChange() {
		this.isChangesExists = true;
		//this.isSizeChanged = true;
	}

	onFormSubmit() {
		const sizeObj = this.sizeForm.value;
		if (this.isChangesExists) {
			this.afterValidation = this.ValidateSize(sizeObj)
			if (this.afterValidation) {
				if (this.sizeIdToUpdate == null)
					this.addSizeMethod(sizeObj);
				else if (this.sizeIdToUpdate != null && this.isChangesExists)
					this.updateSizeData(sizeObj);
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Size", "check_circle", false);
		}
	}
	// validation for duplicate Size.
	ValidateSize(result: Size): boolean {
		this.isValid = true;
		this.sizeDataSource.data.forEach(item => {
			if (item.sizeID != this.sizeIdToUpdate) {
				if (this.sizeIdToUpdate == null) {
					if (item.size.toLowerCase().trim() === result.size.toLowerCase().trim()) {
						this.isValid = false;
					}
				}
				else {
					if (item.size.toLowerCase().trim() === result.size.toLowerCase().trim()) {
						this.isValid = false;
					}
				}
			}
			else {
				if (item.size.trim() === result.size.trim()) {
					this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Size", "check_circle", false);
					this.isChangesExists = false;
					return this.isValid;
				}
			}
		});

		if (!this.isValid) {
			this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Size", "check_circle", false);
			return this.isValid;
		}
		return this.isValid;
	}

	//Add Size.
	addSizeMethod(oSize: Size) {
		this.sizeService.createSize(oSize).subscribe(() => {
			this.saveData();
		},
			(error) => {
				this.size.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Size", "check_circle", false);
		this.isChangesExists = false;
		this.fromSave = true;
		this.loadAllSizes();
		this.ResetChanges();
	}

	// Update Size Data.
	async updateSizeData(oSize: Size) {
		oSize.sizeID = this.sizeIdToUpdate;
		this.sizeService.updateSize(oSize).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Size", "check_circle", false);
			this.sizeIdToUpdate = null;
			this.isChangesExists = false;
			this.loadAllSizes();
			this.selectRow(this.sizeDataSource.data[this.currentRowIndex]);
		},
			(error) => {
				this.size.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async deleteSize(id: number) {
		if(this.checkData()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedSize(id);				
			}
		}
		else{
			this.deleteSelectedSize(id);	
		}	
	}
	
	async deleteSelectedSize(id:number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.sizeService.deleteSizeById(id).subscribe(
				result => {
					if (result.message == MessageConstants.RECORDINUSE) {
						this.popupService.openAlertDialog(MessageConstants.Size_RECORDINUSE, "Size", "check_circle");
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
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Size", "check_circle", false);
		this.loadAllSizes();
		this.ResetChanges();
	}

	async selectRow(row: any) {
		if (this.checkData()) {
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.populateData(row);
				this.isChangesExists = false;
			}
		}
		else {
			this.populateData(row);
		}
	}

	checkData() {
		const size: Size = this.sizeForm.value;
		let changesExist = false;
		if (this.isChangesExists) {
			if (this.sizeIdToUpdate == null) {

				if ((size.size && size.size.trim() != '') || size.size.toLocaleString().length > 0) {
					changesExist = true;

				}
			}
			else {

				for (let i = 0; i < this.sizeDataSource.data.length; i++) {
					if (this.sizeDataSource.data[i].sizeID == this.sizeIdToUpdate) {
						if (this.sizeDataSource.data[i].size != size.size) {
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
		this.currentRowIndex = this.sizeDataSource.data.indexOf(row);
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.setFocus();
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.loadSizeToEdit(row);
		this.setSaveBtnEnable();
	}

	loadSizeToEdit(row) {
		this.sizeForm.controls["size"].setValue(row.size);
		this.sizeIdToUpdate = row.sizeID;
		this.isChangesExists = false;
	}

	//To clear form data.
	async clearSize() {
		if (this.checkData()) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.ResetChanges();
				this.searchText = "";
				this.filterData(this.searchText);
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			this.filterData(this.searchText);
		}

	}
	ResetChanges() {
		this.highlightedRows.pop();
		this.myForm.resetForm();
		this.sizeIdToUpdate = null;
		this.isValid = true;
		this.isChangesExists = false;
		this.isInUse = false;
		this.currentRowIndex = -1;
		this.setFocus();
		this.setSaveBtnEnable();
	}

	public hasError = (controlName: string, errorName: string) => {
		return this.sizeForm.controls[controlName].hasError(errorName);
	}

	public doFilter(filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterData(filterValue);
			this.ResetChanges();
		}
		else {
			this.searchText = "";
			this.filterData(this.searchText);
		}
	}

	filterData(filterValue: string) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.sizeDataSource.filterPredicate = (data: any, filter: string) => {
			if (this.validateWildCardType(data.size.toLowerCase(), filterValue.toLowerCase())) {
				return data.size;
			}
		}
		this.sizeDataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = (this.sizeDataSource.filteredData.length > 0) ? true : false;
	}


	//Validates the wild card search. 
	validateWildCardType(str, rule) {
		var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
	}

	//to omit special characters.
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

	
	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
		canDeactivate(): Observable<boolean> | boolean {
		return !this.checkData();
	}
}
