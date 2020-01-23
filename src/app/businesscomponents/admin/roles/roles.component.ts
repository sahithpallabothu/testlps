//Angular components.
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';

//Bussiness Services.
import { Role, privileges } from '../../../businessclasses/admin/Role';
import { RoleScreenService } from '../../../businessservices/admin/roles.service';
import { UserPrivilegesService } from '@/_services';

//Services.
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { AuthenticationService } from '@/_services';

//Constants.
import { SpaceValidator } from '@/shared/spaceValidator';
import { Constants } from '@/app.constants';
import { MessageConstants } from '@/shared/message-constants';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-rolescreen',
	templateUrl: './roles.component.html',
	styleUrls: ['./roles.component.css']
})
export class RolescreenComponent implements OnInit {
	//Variables declaration.
	RolesForm: FormGroup;
	highlightedRows = [];
	searchText: string;
	allRoles: Observable<Role[]>;
	updateRoleId: number = -1;
	result: boolean;
	isValid: boolean = true;
	tableColumns: string[] = ['roleName', 'roleDescriprion', 'roleActive'];
	privilegestableColumns: string[] = ['screenName', 'read', 'insert', 'update', 'delete'];
	dataSource = new MatTableDataSource<any>();
	previlegesdataSource = new MatTableDataSource<privileges>();
	previlageslist: Observable<privileges[]>;
	privilegeArray: any = [];
	isAdmin: boolean = false;
	fromSave: boolean = false;
	roleNameChanged: boolean = false;
	privilageChanged: boolean = false;
	initialPrivilageResult: any;
	spaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	ischeckValidation: boolean = false;
	errorMatcher = new ErrorMatcher()
	// search no data found.
	isTableHasData = true;
	//To set focus.
	@ViewChild('roleName') roleName: ElementRef;
	//Variable used to sort data in grid.
	@ViewChild('previlageTable') previlageTable: MatSort;
	@ViewChild('rolesTable') rolesTable: MatSort;
	@ViewChild('f') myForm;
	@ViewChild('filterText') filterText: ElementRef;
	isInUse: boolean = false;
	currentRowIndex: number = -1;
	isExistInSession = false;
	//To load screens and allowed privilages.
	public Screens = [
		{ "screenId": 1, "screenName": "Admin Screens", "allowedPrivilege": "RUID" },
		{ "screenId": 2, "screenName": "File Counts", "allowedPrivilege": "RUD" },
		{ "screenId": 3, "screenName": "Inserts", "allowedPrivilege": "RUID" },
		{ "screenId": 4, "screenName": "Running Summary", "allowedPrivilege": "RU" },
		{ "screenId": 5, "screenName": "Reports", "allowedPrivilege": "R" },
		{ "screenId": 6, "screenName": "Customer", "allowedPrivilege": "RUID" },
		{ "screenId": 7, "screenName": "Application", "allowedPrivilege": "RUID" },
		{ "screenId": 8, "screenName": "Change Print Location", "allowedPrivilege": "RU" },
		{ "screenId": 9, "screenName": "Additional Charges", "allowedPrivilege": "RIUD" },
		{ "screenId": 10, "screenName": "Edit Customer (Full Access)", "allowedPrivilege": "U" },
		{ "screenId": 11, "screenName": "File Adjustment", "allowedPrivilege": "U" }
	];

	//Screen privilege variables
	hasScreenDeletePriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	isAllowSave: boolean = false;

	constructor(private formbulider: FormBuilder,
		private roleScreenService: RoleScreenService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
		private authenticationService: AuthenticationService,
	) {
		//Set Roles screen privileges
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
		this.RolesForm = this.formbulider.group({
			RoleName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			roleDescriprion: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			RoleActive: ['true', []]
		});
		this.ischeckValidation = false;
		this.loadAllRoles();
		this.loadAllscreenPrivileges();
		this.loadSearchCriteria();
		this.tableDataSort();
		this.setFocus();
		this.setSaveBtnEnable();
		if (this.hasScreenDeletePriviledge) {
			this.tableColumns = ['roleName', 'roleDescriprion', 'roleActive', 'delete'];
		}

	}

	//Set Save button Enable/Disable base on privileges
	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.updateRoleId === -1) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.updateRoleId !== -1) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}
	}

	//to set focus.
	setFocus() {
		setTimeout(() => {
			this.roleName.nativeElement.setSelectionRange(this.roleName.nativeElement.value.length, this.roleName.nativeElement.value.length);
			this.roleName.nativeElement.focus();
		}, 0);
	}

	tableDataSort() {
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId].toLocaleLowerCase() === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		this.previlegesdataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId].toLocaleLowerCase() === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
	}

	public filterByRole = [
		{ "id": 1, "name": "Role Name" },
		{ "id": 2, "name": "Comments" },
	]
	public selectedFilterByRole = 1;


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

	//Filter Data in grid.
	public doFilter(selectedVal: number, filterValue: string) {
		if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
			this.filterData(selectedVal, filterValue, true);
			this.ResetChanges();
		}
		else if ((filterValue && filterValue.trim() == "") || filterValue == null || filterValue == "" || filterValue == undefined) {
			this.searchText = "";
			this.filterData(this.selectedFilterByRole, this.searchText, false);
		}

	}

	filterData(selectedVal: number, filterValue: string, localStorageFlag) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: string) => {
			if (selectedVal == 1) {
				if (this.validateWildCardType(data.roleName.toLowerCase(), filterValue.toLowerCase())) {
					return data.roleName;
				}
			}
			if (selectedVal == 2) {
				if (this.validateWildCardType(data.roleDescriprion.toLowerCase(), filterValue.toLowerCase())) {
					return data.roleDescriprion;
				}
			}
		}

		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;

		//storing search criteria to local storage.
		if (localStorageFlag) {
			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.rolesSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				searchCriteriaObj.push({ screenName: Constants.rolesSubmenu, searchBy: selectedVal });
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

	// to omit special characters.
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


	// Load Roles.
	async loadAllRoles() {
		this.allRoles = await this.roleScreenService.getAllRoles(true);
		this.allRoles.subscribe(results => {
			if (!results) { return };
			this.dataSource.data = results;
			this.dataSource.sort = this.rolesTable;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
			if (this.highlightedRows.length > 0) {
				this.seclectRowFunctionality(this.dataSource.data[this.currentRowIndex]);
			}

		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	//load search criteria from local storage.
	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.rolesSubmenu) : -1;
		if (index == -1) {
			this.selectedFilterByRole = 1;
			this.isExistInSession = false;
		}
		else {
			this.selectedFilterByRole = searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}

	//Get ScreenPrivileges by Role Id.
	ScreenPrivilegesByRoleId(id) {
		this.previlageslist = this.roleScreenService.getScreenPrevillegesByRoleById(id);
		this.previlageslist.subscribe(results => {
			if (!results) { return };
			this.initialPrivilageResult = results;
			var obj = this.ScreenPrivilege(results);
			this.previlegesdataSource.data = obj;
			this.previlegesdataSource.sort = this.previlageTable;
			this.ischeckValidation = true;
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//Intial Load Screens. 
	loadAllscreenPrivileges() {
		var obj = this.allowedScreenPrivileges(this.Screens);
		this.previlegesdataSource.data = obj;
		this.previlegesdataSource.sort = this.previlageTable;
	}

	//Below method will do allow Enable/Disable Screen privileges checkboxes.
	allowedScreenPrivileges(obj: any): any {
		var globalTempObj = [];
		for (var i = 0; i < obj.length; i++) {
			let tempObj = {
				screenName: obj[i].screenName,
				rolePrivilegeId: obj[i].screenId,
				Privilege: obj[i].allowedPrivilege,
				read: false,
				insert: false,
				update: false,
				delete: false,
				iDisable: !obj[i].allowedPrivilege.includes("I"),
				rDisable: !obj[i].allowedPrivilege.includes("R"),
				uDisable: !obj[i].allowedPrivilege.includes("U"),
				dDisable: !obj[i].allowedPrivilege.includes("D")
			};

			globalTempObj.push(tempObj);
		}
		return globalTempObj;
	}

	//Below method will do  allow Enable/Disable Screen privilege checkboxes (Screen Privilege by role id).
	ScreenPrivilege(obj: any): any {
		var globalTempObj = [];
		this.Screens.forEach(screen => {
			for (var i = 0; i < obj.length; i++) {
				if (screen.screenName === obj[i].screenName) {
					let tempObj = {
						screenName: screen.screenName,
						rolePrivilegeId: obj[i].rolePrivilegeId,
						privileges: obj[i].privilege,
						read: obj[i].privilege.includes("R"),
						insert: obj[i].privilege.includes("I"),
						update: obj[i].privilege.includes("U"),
						delete: obj[i].privilege.includes("D"),
						iDisable: !screen.allowedPrivilege.includes("I"),
						rDisable: !screen.allowedPrivilege.includes("R"),
						uDisable: !screen.allowedPrivilege.includes("U"),
						dDisable: !screen.allowedPrivilege.includes("D")//this.isAdmin && obj[i].screenName === "Postage" ? false :!screen.allowedPrivilege.includes("D")
					}
					globalTempObj.push(tempObj);

				}
			}
		});
		return globalTempObj;
	}

	//CheckBoxes Chage Event.
	onChange(event, index, item) {
		this.previlegesdataSource.data.forEach(currow => {
			if (currow.screenName == item.screenName) {
				this.updatePrivilegiousDataRow(currow, index, event);
			}

		});
	}

	//Upadting the privilege Datasource in update mode.
	updatePrivilegiousDataRow(currntrow, index, event) {
		if (index == 1)  // READ
		{
			currntrow.read = event.checked;
		}
		else if (index == 2) // INSERT
		{
			currntrow.insert = event.checked;
		}
		else if (index == 3) // UPDATE
		{
			currntrow.update = event.checked;
		}
		else if (index == 4) // DELETE
		{
			currntrow.delete = event.checked;
		}

	}

	onFormSubmit() {
		if (this.highlightedRows.length > 0) {
			this.ischeckValidation = true;
		}
		const roledata = this.RolesForm.value;
		roledata.roleName = this.RolesForm.get('RoleName').value.trim();
		roledata.Privileges = this.previlegesdataSource.data;
		this.roleNameChanged = false;
		this.dataSource.data.forEach(item => {
			if (item.roleId != this.updateRoleId) {
				if (item.roleName.toLowerCase().trim() === roledata.roleName.toLowerCase().trim()) {
					this.roleNameChanged = true;
				}
			}
		});

		if (this.ValidateRoles() && !this.roleNameChanged) {
			this.isValid = true;
			if (this.updateRoleId == -1) {
				this.saveRoleData(roledata);
			}
			else if (this.updateRoleId != -1) {
				this.updateRoleData(roledata);
			}
		}
		else {
			if (this.roleNameChanged) {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Roles", "check_circle", false);
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Roles", "check_circle", false);
			}

		}
	}

	//Update Role
	updateRoleData(roledata: Role) {
		roledata.roleId = this.updateRoleId;
		this.roleScreenService.updateRole(roledata).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Roles", "check_circle", false);
			this.privilageChanged = false;
			this.updateRoleId = -1;
			this.loadAllRoles();
			this.tableDataSort();
			if (Constants.SSO) {
				this.authenticationService.checkAdminExist();
			}
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	//validation of constrains
	ValidateRoles(): boolean {
		let dataChanged = false;
		const roledata = this.RolesForm.value;
		if (this.ischeckValidation) {
			roledata.roleName = this.RolesForm.get('RoleName').value;
			roledata.Privileges = this.previlegesdataSource.data;
			this.privilageChanged = false;
			let initialPrivilages = this.ScreenPrivilege(this.initialPrivilageResult);
			initialPrivilages.forEach(oldPrivilage => {
				for (var i = 0; i < roledata.Privileges.length; i++) {
					if (oldPrivilage.rolePrivilegeId == roledata.Privileges[i].rolePrivilegeId) {
						if (oldPrivilage.read !== roledata.Privileges[i].read ||
							oldPrivilage.insert !== roledata.Privileges[i].insert ||
							oldPrivilage.update !== roledata.Privileges[i].update ||
							oldPrivilage.delete !== roledata.Privileges[i].delete) {
							this.privilageChanged = true;
						}
					}
				}
			});
			if (this.highlightedRows.length > 0) {
				if ((this.highlightedRows[0].roleName === roledata.roleName &&
					this.highlightedRows[0].roleDescriprion === roledata.roleDescriprion &&
					this.highlightedRows[0].roleActive === roledata.RoleActive) && !this.privilageChanged) {
					dataChanged = false;
				}
				else {
					dataChanged = true;
				}
			}
			else {
				dataChanged = true;
			}
		}
		if (this.highlightedRows.length == 0 && ((this.RolesForm.controls['RoleName'].value != '' && this.RolesForm.controls['RoleName'].value != undefined) || (this.RolesForm.controls['roleDescriprion'].value != '' && this.RolesForm.controls['roleDescriprion'].value != undefined) || this.RolesForm.controls['RoleActive'].value==false)) {
			dataChanged = true;
		}
		else if (this.highlightedRows.length == 0 && (!((this.RolesForm.controls['RoleName'].value != '' && this.RolesForm.controls['RoleName'].value != undefined) || (this.RolesForm.controls['roleDescriprion'].value != '' && this.RolesForm.controls['roleDescriprion'].value != undefined)) || this.RolesForm.controls['RoleActive'].value==true)) {
			dataChanged = false;
		}
		return dataChanged;
	}

	async saveRoleData(oRoledata: Role) {
		this.roleScreenService.createRole(oRoledata).subscribe(() => {
			this.saveData();
			if (Constants.SSO) {
				this.authenticationService.checkAdminExist();
			}

		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Roles", "check_circle", false);
		this.ResetChanges();
		this.fromSave = true;
		this.loadAllRoles();
		this.tableDataSort();
	}

	//delete
	async deleteRoles(updateRoleId: number) {
		if(this.ValidateRoles()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.ResetChanges();
				this.deleteSelectedRoles(updateRoleId);				
			}
		}
		else{
			this.deleteSelectedRoles(updateRoleId);	
		}			
	}

	async deleteSelectedRoles(updateRoleId: number){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			this.roleScreenService.deleteRoleById(updateRoleId).subscribe(res => {
				if (res.message[0] == MessageConstants.RECORDINUSE) {
					this.popupService.openAlertDialog(MessageConstants.Roles_RECORDINUSE, "Roles", "check_circle", true, res.message[1], this.isInUse, "Users");
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
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Roles", "check_circle", false);
		this.loadAllRoles();
		this.ResetChanges();
		if (Constants.SSO) {
			await this.authenticationService.checkAdminExist();
		}

	}

	// To clear form data.
	async resetForm() {
		if (this.ValidateRoles()) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.ResetChanges();
				this.searchText = "";
				if (!this.isExistInSession) {
					this.selectedFilterByRole = 1;
				}
				this.setSaveBtnEnable();
				this.filterData(this.selectedFilterByRole, this.searchText, false);
				this.loadSearchCriteria();
			}
		}
		else {
			this.ResetChanges();
			this.searchText = "";
			if (!this.isExistInSession) {
				this.selectedFilterByRole = 1;
			}
			this.setSaveBtnEnable();
			this.filterData(this.selectedFilterByRole, this.searchText, false);
			this.loadSearchCriteria();
		}
	}

	//Reset data.
	ResetChanges() {
		this.updateRoleId = -1;
		this.highlightedRows.pop();
		this.myForm.resetForm();
		this.ischeckValidation = false;
		this.loadAllscreenPrivileges();
		this.RolesForm.controls["RoleActive"].setValue(true);
		this.isAdmin = false;
		this.isInUse = false;
		this.currentRowIndex = -1;
		this.setFocus();
	}

	// Select Role 
	async selectRow(row) {
		this.currentRowIndex = this.dataSource.data.indexOf(row);
		this.setFocus();
		this.isAdmin = false;
		this.isInUse = false;

		if (this.ValidateRoles()) {
			if (this.updateRoleId != row.roleId) {
				const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
				if (userresponse === "ok") {

					this.seclectRowFunctionality(row);
				}
			}
		}
		else {
			this.seclectRowFunctionality(row);
		}


	}

	seclectRowFunctionality(row) {
		if (row.isinuse === 'Y') {
			this.isInUse = true;
		}

		if (row.roleName.toLowerCase() === MessageConstants.ADMINNAME.toLowerCase()) {
			this.isAdmin = true;
		}
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.updateRoleId = row.roleId;
		this.RolesForm.controls['RoleName'].setValue(row.roleName);
		this.RolesForm.controls['roleDescriprion'].setValue(row.roleDescriprion);
		this.RolesForm.controls['RoleActive'].setValue(row.roleActive);
		this.ScreenPrivilegesByRoleId(this.updateRoleId);
		this.setSaveBtnEnable();
	}

	public hasError = (controlName: string, errorName: string) => {
		return this.RolesForm.controls[controlName].hasError(errorName);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {		
		return !this.ValidateRoles() ;
	}

}

