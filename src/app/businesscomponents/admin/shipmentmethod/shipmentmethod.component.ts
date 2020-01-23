import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { ShipmentmethodService } from '../../../businessservices/admin/shipmentmethod.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { Shipmentmethod } from '../../../businessclasses/admin/shipmentmethod';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-shipmentmethod',
	templateUrl: './shipmentmethod.component.html',
	styleUrls: ['./shipmentmethod.component.css']
})

export class ShipmentmethodComponent implements OnInit {
	// variable declarations.
	allShipmentMethods: Observable<Shipmentmethod[]>;
	shipmentMethodForm: FormGroup;
	public index: Number;
	isValid: boolean = true;
	result: any;
	isChangesExists: boolean = false;
	isShipmentMethodChanged: boolean = false;
	idToUpdate = null;
	searchText: string;
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	isInUse: boolean = false;
	// table declarations.
	highlightedRows = [];
	isTableHasData = true;
	tableColumns: string[] = ['shipmentMethod'];
	shipmentMethodDataSource = new MatTableDataSource<Shipmentmethod>();
	@ViewChild(MatSort) sort: MatSort;
	//to set foucs. 
	@ViewChild('shipmentmethod') shipmentmethodFocus: ElementRef;
	@ViewChild('f') myForm;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	errorMatcher = new ErrorMatcher();
	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;
	currentRowIndex: number = -1;
	fromSave: boolean = false;

	constructor(
		private formbulider: FormBuilder,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private shipmentMethodService: ShipmentmethodService,
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
		this.shipmentMethodForm = this.formbulider.group({
			shipmentMethod: ['', [Validators.required, SpaceValidator.ValidateSpaces]]
		});
		this.loadAllSipmentMethods();
		this.shipmentMethodDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};

		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['shipmentMethod','delete'];
		}
		this.setFocus();
		this.setSaveBtnEnable()
	}

	//to enable or disable save button based on privilege.
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

	//to set focus.
	setFocus() {
		setTimeout(() => {
			this.shipmentmethodFocus.nativeElement.setSelectionRange(this.shipmentmethodFocus.nativeElement.value.length, this.shipmentmethodFocus.nativeElement.value.length);
			this.shipmentmethodFocus.nativeElement.focus();
		}, 0);
	}


	// To show validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.shipmentMethodForm.controls[controlName].hasError(errorName);
	}

	// To load SipmentMethod data.
	loadAllSipmentMethods() {
		this.allShipmentMethods = this.shipmentMethodService.getAllShipmentMethods(true);
		this.allShipmentMethods.subscribe(results => {
			if (!results) { return };
			this.shipmentMethodDataSource.data = results;
			this.shipmentMethodDataSource.sort = this.sort;
			this.isTableHasData = this.shipmentMethodDataSource.data.length > 0 ? true : false;
			if (this.currentRowIndex >= 0) {
				this.loadShipmentMethodToEdit(this.shipmentMethodDataSource.data[this.currentRowIndex])
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	onFormSubmit() {
		const shipmentMethod = this.shipmentMethodForm.value;
		this.isShipmentMethodChanged = false;
		this.shipmentMethodDataSource.data.forEach(item => {
			if (item.shipmentMethodID != this.idToUpdate) {
				if (item.shipmentMethod.toLowerCase().trim() === shipmentMethod.shipmentMethod.toLowerCase().trim()) {
					this.isShipmentMethodChanged = true;
				}
			}
		});
		if (!this.ValidateShipmentMethod() && !this.isShipmentMethodChanged) {
			if (this.idToUpdate == null)
				this.addShipmentMethod(shipmentMethod);
			else if (this.idToUpdate != null && (this.isChangesExists || this.isShipmentMethodChanged))
				this.updateShipmentMethodData(shipmentMethod);
		}
		else {
			if (this.isShipmentMethodChanged) {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Shipment Method", "check_circle", false);
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Shipment Method", "check_circle", false);
			}
		}
	}

	// validation for duplicate description.
	ValidateShipmentMethod() {
		const shipmentmethod = this.shipmentMethodForm.value;
		var dataChanged = false;
		if (this.highlightedRows.length > 0) {
			if (this.highlightedRows[0].shipmentMethod === shipmentmethod.shipmentMethod) {
				dataChanged = true;
			}
			else {
				dataChanged = false;
			}
		}
		else {
			if (this.idToUpdate == null && ((shipmentmethod.shipmentMethod != "" && shipmentmethod.shipmentMethod != null))) {
				dataChanged = false;
			}
			else{
				dataChanged = true;
			}

		}

		return dataChanged;
	}

	// To filter data in the grid.
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
		this.shipmentMethodDataSource.filterPredicate = (data: any, filter: string) => {
			if (this.validateWildCardType(data.shipmentMethod.toLowerCase(), filterValue.toLowerCase())) {
				return data.shipmentMethod;
			}
		}
		this.shipmentMethodDataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.shipmentMethodDataSource.filteredData.length > 0 ? true : false;

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
	SetShipmentMethodChanges(value: boolean) {
		this.isShipmentMethodChanged = value;
		this.isChangesExists = value;
	}


	// To highlight selected row in the grid.
	async selectRow(row: any) {
		if (!this.ValidateShipmentMethod()) {
			if (this.idToUpdate != row.shipmentMethodID) {
				if (await this.checkDataChange()) {
					this.loadShipmentMethodToEdit(row);
				}
			}
		}
		else {
			this.loadShipmentMethodToEdit(row);
		}
	}

	//to check data change.
	async checkDataChange() {
		let shipmentmethod = this.shipmentMethodForm.value;
		if (this.idToUpdate != null) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				return true;
			}
		}
		else {
			if (this.idToUpdate == null && ((shipmentmethod.shipmentMethod != "" && shipmentmethod.shipmentMethod != null))) {
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

	//To Update Shipment method.
	loadShipmentMethodToEdit(row: any) {
		this.isInUse = false;
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}
		this.currentRowIndex = this.shipmentMethodDataSource.data.indexOf(row);
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.SetShipmentMethodChanges(false);
		this.idToUpdate = row.shipmentMethodID;
		this.shipmentMethodForm.controls["shipmentMethod"].setValue(row.shipmentMethod);
		this.setSaveBtnEnable();
		this.setFocus();
	}

	//Form field change event.
	isChange() {
		this.isChangesExists = true;
		this.isShipmentMethodChanged = true;
	}

	//To save Shipment Method data.
	addShipmentMethod(shipmentMethod: Shipmentmethod) {
		this.shipmentMethodService.createShipmentMethod(shipmentMethod).subscribe(() => {
			this.saveData();
		},
			(error) => {
				this.shipmentmethodFocus.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Shipment Method", "check_circle", false);
		this.fromSave = true;
		this.loadAllSipmentMethods();
		this.ResetChanges();
	}

	// Update Shipment Method Data.
	async updateShipmentMethodData(shipmentMethod: Shipmentmethod) {
		shipmentMethod.shipmentMethodID = this.idToUpdate;
		this.shipmentMethodService.updateShipmentMethod(shipmentMethod).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Shipment Method", "check_circle", false);
			this.idToUpdate = null;
			this.SetShipmentMethodChanges(false);
			this.loadAllSipmentMethods();
			this.isChangesExists = false;
			this.loadShipmentMethodToEdit(this.shipmentMethodDataSource.data[this.currentRowIndex]);
		},
			(error) => {
				this.shipmentmethodFocus.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	// To delete Apptype data.
	async deleteShipmentMethod(shipmentMethodID: number) {
		if(!this.ValidateShipmentMethod()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedShipmentMethod(shipmentMethodID);				
			}
		}
		else{
			this.deleteSelectedShipmentMethod(shipmentMethodID);	
		}			
	}

	async deleteSelectedShipmentMethod(shipmentMethodID:number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.shipmentMethodService.deleteShipmentMethodById(shipmentMethodID).subscribe(
				result => {
					if (result.message == MessageConstants.RECORDINUSE) {
						this.popupService.openAlertDialog(MessageConstants.SHIPMENTMETHOD_RECORDINUSE, "Shipment Method", "check_circle", false);
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
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Shipment Method", "check_circle", false);
		this.loadAllSipmentMethods();
		this.ResetChanges();
	}

	//To clear form data.
	async clearShipmentMethod() {
		if (!this.ValidateShipmentMethod()) {
			if (await this.checkDataChange()) {
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

	//reset data.
	ResetChanges() {
		this.highlightedRows.pop();
		this.myForm.resetForm();
		this.idToUpdate = null;
		this.isValid = true;
		this.isInUse = false;
		this.SetShipmentMethodChanges(false);
		this.currentRowIndex = -1;
		this.setSaveBtnEnable();
		this.setFocus();

	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
		canDeactivate(): Observable<boolean> | boolean {
		return this.ValidateShipmentMethod();
	}
	
}// Component ends here

