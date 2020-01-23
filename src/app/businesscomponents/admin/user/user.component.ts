// Angular components.
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from "@angular/router"
import { MatSort, MatTableDataSource } from '@angular/material';

// Business classes.
import { User, Location } from '@/businessclasses/admin/User';
import { Role, privileges } from '@/businessclasses/admin/Role';
import { Department } from '../../../businessclasses/admin/department';

// Business services.
import { UserScreenService } from '../../../businessservices/admin/users.service';
import { RoleScreenService } from '../../../businessservices/admin/roles.service';
import { DepartmentService } from '../../../businessservices/admin/department.service';

// Popup messages. 
import { MessageConstants } from '@/shared/message-constants';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { SpaceValidator } from '@/shared/spaceValidator';

import { MatDialog, MatDialogConfig } from "@angular/material";
import { RolesDialogComponent } from '@/businesscomponents/admin/user/roles-dialog/roles-dialog.component';
import { Constants } from '@/app.constants';
import { UserPrivilegesService } from '@/_services';
import { TrimMask } from '@/shared/trimMask';
import { ErrorMatcher } from '@/shared/errorMatcher';
import { BrowserOptionsComponent } from '@/browser-options/browser-options.component';
import { AuthenticationService } from '@/_services';
import { HostListener } from '@angular/core';
@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit {
	// Variable declarations for table.
	tableColumns: string[] = ['userName', 'name', 'isActive'];
	roletabledisplayedColumns: string[] = ['roleName', 'selected'];
	dataSource = new MatTableDataSource<User>();
	rolesdataSource = new MatTableDataSource<any>();
	allUsers: Observable<User[]>;
	allRoles: Observable<Role[]>;
	UserIDToUpdate = null;
	highlightedRows = [];
	selectedRow = [];
	isTableHasData = true;
	@ViewChild(MatSort) sort: MatSort;
	rolesList: any;
	checkedRoleList: any[] = [];
	errorMatcher = new ErrorMatcher();
	// Variable declarations for search.
	searchText: string;
	ifFilterBySelected = true;

	// Variable declarations for department dropdown.
	allDepartments: Observable<Department[]>;
	departmentArray = [];
	departmentName: string;

	// Variable declarations for Location dropdown.
	allLocations: Observable<Location[]>;
	locationArray = [];
	LocationName: string;

	// Variable declarations for form.
	userForm: FormGroup;
	@ViewChild('firstName') firstNameFocus: ElementRef;
	@ViewChild('userName') userNameFocus: ElementRef;
	@ViewChild('filterText') filterText: ElementRef;
	passwordHide = true;
	confirmPasswordHide = true
	isChangesExists: boolean = false;
	isUserNameChanged: boolean = false;
	isRoleChangesExists: boolean = false;
	isValidUser: boolean = true;
	resultForValidUser: any;
	roleAdminCount: number = 0;
	telephonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	isValidcellphoneNumber: boolean = false;
	ValidcellphoneMessage = "";
	selectedUserName: string;
	unAssignedRoles: Role[] = [];
	allRolesList = [];
	isDialogButtonDiabled: boolean = true;
	isUnassign: boolean = false;
	//to reset the form.
	@ViewChild('f') myForm;
	isAdmin: boolean = false;
	//Screen privilege variables
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	latestRowId: number = -1;
	localUserData = [];
	isChangeExist: boolean;
	localUserRoles = [];
	domainName: string;
	isExistInSession = false;
	//For checking admin role
	previlageslist: Observable<privileges[]>;
	initialPrivilageResult: any;
	isAllowSave: boolean = false;
	//Constructor. 
	constructor(private formBuilder: FormBuilder,
		private popupService: PopupMessageService,
		private usersservice: UserScreenService,
		private errorService: ErrorHandlerService,
		private router: Router,
		private roleScreenService: RoleScreenService,
		private DepartmentService: DepartmentService,
		private dialog: MatDialog,
		private userPrivilegesService: UserPrivilegesService,
		private authenticationService: AuthenticationService,
	) {

		//Set User screen privileges
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenUpdatePriviledge = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.adminScreenName)) {
			this.hasScreenInsertPriviledge = true;
		}
	}

	//OnInit for form loading actions.
	ngOnInit() {
		this.userForm = this.formBuilder.group({
			firstName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			lastName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			departmentId: ['', [Validators.required]],
			userName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			isActive: [true, []],
			emailAddress: ['', [Validators.required, Validators.pattern(/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
			extension: ['', []],//[Validators.required]],
			cellPhone: ['', [this.validateTelephone]],
			locationID: ['', [Validators.required]],
			initials: ['', [Validators.maxLength(4), SpaceValidator.ValidateSpaces]],
		});//,{ validator: this.telephoneValidation }
		this.loadSearchCriteria();
		this.loadAllUsers();

		this.loadAllDepartments();
		this.loadAllLocations();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
		this.setFocusUserName();
		this.getDomainName();
		this.loadAllRoles();
		this.setSaveBtnEnable()
		if (Constants.SSO) {
			if (JSON.parse(sessionStorage.getItem('AdminExist')) == false) {
				this.popupService.openAlertDialog("The application does not currently have a user with access to the Admin screens. Please create a user with full access to the Admin screens before proceeding with the creation of other users.", "Users", "check_circle", true);
			}
		}
	}

	setSaveBtnEnable() {
		if (this.hasScreenInsertPriviledge && this.UserIDToUpdate == null) {
			this.isAllowSave = true;
		} else if (this.hasScreenUpdatePriviledge && this.UserIDToUpdate !== null) {
			this.isAllowSave = true;
		}
		else {
			this.isAllowSave = false;
		}

	}

	//To set focus for first control in the form. 
	setFocus() {
		setTimeout(() => {
			this.firstNameFocus.nativeElement.setSelectionRange(this.firstNameFocus.nativeElement.value.length, this.firstNameFocus.nativeElement.value.length);
			this.firstNameFocus.nativeElement.focus();
		}, 0);
	}
	setFocusUserName() {
		setTimeout(() => {
			this.userNameFocus.nativeElement.setSelectionRange(this.userNameFocus.nativeElement.value.length, this.userNameFocus.nativeElement.value.length);
			this.userNameFocus.nativeElement.focus();
		}, 0);
	}
	//Get domain name 
	getDomainName() {
		this.usersservice.GetDomainName().subscribe(result => {
			this.domainName = result['domainName'];
		},
			(error) => {
				console.log('Error', error);
			});
	}

	//Validate username and user domain
	ValidateUserInDomain() {
		let userName = this.userForm.controls['userName'].value;
		let index = this.dataSource.data.length > 0 ? this.dataSource.data.findIndex(x => x.userName.toLowerCase() == userName.toLowerCase()) : -1;
		if (userName.trim() != '') {
			if (index == -1) {
				if (this.latestRowId == -1) {
					this.usersservice.ValidateUserInDomain(userName).subscribe(result => {
						if (result.isUserExists == true) {
							this.clearAutoFilledData();
							this.populateDomainUserData("firstName", result.firstName);
							this.populateDomainUserData("lastName", result.lastName);
							this.populateDomainUserData("emailAddress", result.emailAddress);
							this.userForm.controls['userName'].setValue(result.userName);
							this.userForm.controls['cellPhone'].setValue(result.cellPhone);
							this.userForm.controls['isActive'].setValue(result.isActive);
							this.userForm.controls['extension'].setValue(result.extension);
						}
						else {
							this.validateInvalidDominFocus();
						}
					},
						(error) => {

							console.log('Error', error);
						})
				}
			} else {
				this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Users", "check_circle", false);
				//this.clearAutoFilledData();
			}
		} else {
			this.clearUserData();
		}
	}

	populateDomainUserData(controlName: string, controlValue: string) {
		if ((this.userForm.controls[controlName].value == '') || (this.userForm.controls[controlName].value == null)) {
			this.userForm.controls[controlName].setValue(controlValue);
		}
	}

	async validateInvalidDominFocus() {
		await this.popupService.openAlertDialog("Invalid Domain User Name.", "Users", "check_circle", false);
		this.clearAutoFilledData();
		this.setFocusUserName();
	}

	//Clear fields
	clearAutoFilledData() {
		this.myForm.resetForm();
		this.userForm.controls["locationID"].setErrors(null);
		this.userForm.controls["departmentId"].setErrors(null);
		this.clearUserData();
	}

	clearUserData() {
		this.userForm.setErrors(null);
		this.userForm.clearValidators();
		this.userForm.controls['firstName'].setValue("");
		this.userForm.controls['lastName'].setValue("");
		this.userForm.controls['userName'].setValue("");
		this.userForm.controls['emailAddress'].setValue("");
		this.userForm.controls['cellPhone'].setValue("");
		this.userForm.controls['isActive'].setValue("");
		this.userForm.controls['extension'].setValue("");
		this.rolesdataSource.data = [];
		this.userForm.controls['userName'].enable();
		this.userForm.controls["isActive"].setValue(true);
		this.userForm.controls["departmentId"].setValue("");
		this.userForm.controls["locationID"].setValue("");
		
		//this.setFocusUserName();
		this.latestRowId = -1;
		this.isAdmin = false;
		this.checkedRoleList = [];
		this.UserIDToUpdate = null;
		this.setSaveBtnEnable();
	}


	loadSearchCriteria() {
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.usersSubmenu) : -1;
		if (index == -1) {
			this.selectedoption = 1;
			this.isExistInSession = false;
		}
		else {
			this.selectedoption = searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}


	//To show hasError for invalid form fields.
	public hasError = (controlName: string, errorName: string) => {
		return this.userForm.controls[controlName].hasError(errorName);
	}

	//Drop down for search options.
	public searchOptions = [
		{ "id": 1, "name": "User Name" },
		{ "id": 2, "name": "Name" },
		{ "id": 3, "name": "Department" },
		{ "id": 4, "name": "Location" },
		{ "id": 5, "name": "Role" },
	];
	public selectedoption = -1;
	checkFilterBySelected() {
		this.ifFilterBySelected = this.selectedoption == 0 ? true : false;
		this.searchText = "";
		this.setSearchTextFocus();
	}
	//to set focus for search text.
	setSearchTextFocus() {
		setTimeout(() => {
			this.filterText.nativeElement.focus();
		}, 0);
	}

	//To check form field change or not.
	isChange() {
		this.isChangesExists = true;
	}

	//To check form unique field change or not.
	userNameChanged() {
		this.isUserNameChanged = true;
	}

	//To load all users data into table.
	loadAllUsers() {
		this.allUsers = this.usersservice.getAllUsers();
		this.allUsers.subscribe(results => {
			if (!results) { return };
			this.dataSource.data = results;
			this.dataSource.sort = this.sort;
			results.sort((a, b) => (a.userName.toLocaleLowerCase() > b.userName.toLocaleLowerCase()) ? 1 : ((b.userName.toLocaleLowerCase() > a.userName.toLocaleLowerCase()) ? -1 : 0));
			if (this.latestRowId != -1) {
				this.selectRowFunctionality(results[this.latestRowId]);
			}
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
		},
			(error) => {
				this.errorService.dispCustomErrorMessage("Could not get Users - Please check your access rights.");
				this.router.navigate(['/500'])
			});
	}

	//To load all roles data into table.
	loadAllRoles() {
		this.allRoles = this.roleScreenService.getAllRoles(false);
		this.allRoles.subscribe(results => {
			if (!results) { return };
			this.rolesList = results;
			this.allRolesList = results;
			this.allRolesList.sort((a, b) => (a.roleName.toLocaleLowerCase() > b.roleName.toLocaleLowerCase()) ? 1 : ((b.roleName.toLocaleLowerCase() > a.roleName.toLocaleLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.dispCustomErrorMessage("Could not get Roles - Please check your access rights.");
				this.router.navigate(['/500'])
			});
	}

	//To load all departments.
	loadAllDepartments() {
		this.allDepartments = this.DepartmentService.getAllDepartments(false);
		this.allDepartments.subscribe(results => {
			if (!results) { return };
			this.departmentArray = results;
			this.departmentArray.sort((a, b) => (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 : ((b.name.toLocaleLowerCase() > a.name.toLocaleLowerCase()) ? -1 : 0));
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	//To load all Locations.
	loadAllLocations() {
		this.allLocations = this.usersservice.getAllLocations();
		this.allLocations.subscribe(results => {
			if (!results) { return };
			this.locationArray = results;
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}


	//To check role checkbox change or not.
	isRoleChange(event, role) {
		this.isUnassign = false;
		this.checkedRoleList.forEach(item => {
			if (role.roleId == item.roleId) {
				this.isRoleChangesExists = true;
				if (event.source.checked) {
					item.selected = event.source.checked;
					this.checkedRoleList.push(item);
					this.checkedRoleList.sort((a, b) => (a.roleName.toLocaleLowerCase() > b.roleName.toLocaleLowerCase()) ? 1 : ((b.roleName.toLocaleLowerCase() > a.roleName.toLocaleLowerCase()) ? -1 : 0));
				}
				else {
					let index: number = this.checkedRoleList.findIndex(d => d.roleId === item.roleId);
					this.confirmationBeforeUnassigningRole(index, item, event);
				}
			}
		});
	}

	//confirmationBeforeUnassigningRole
	async confirmationBeforeUnassigningRole(index: number, item: any, event: any) {
		const updateConfirmation = await this.popupService.openConfirmDialog(MessageConstants.UNAASIGNROLECONFIRMATION, "help_outline", false);
		if (updateConfirmation === "ok") {
			this.isUnassign = true;
			this.checkedRoleList.splice(index, 1);
			this.rolesdataSource.data = this.checkedRoleList;
			item.selected = false;
			this.unAssignedRoles.push(item);
		}
		else {
			event.source.checked = true;
			return this.isUnassign = false;
		}

		return this.isUnassign;
	}

	//To check department dropdown change or not.
	isChangeDepartment(event) {
		this.isChangesExists = true;
		for (let depart of this.departmentArray) {
			if (depart.recID === event.source.value) {
				this.departmentName = depart.name;
				this.userForm.controls['departmentId'].setValue(depart.recID);
			}
			else if (event.source.value === -1) {
				this.userForm.controls['departmentId'].setValue(-1);
			}
		}
	}


	//To check location dropdown change or not.
	isChangeLocation(event) {
		this.isChangesExists = true;
		for (let loc of this.locationArray) {
			if (loc.locationId === event.source.value) {
				this.LocationName = loc.Location;
				this.userForm.controls['locationID'].setValue(loc.locationId);
			}
			else if (event.source.value === -1) {
				this.userForm.controls['locationID'].setValue(-1);
			}
		}
	}



	// On form submit data.
	async onFormSubmit() {
		if (this.isChangesExists || this.isUserNameChanged || this.isRoleChangesExists) {
			this.resultForValidUser = this.ValidateUser(this.createObj());
			if (this.resultForValidUser) {
				let obj = this.createObj();
				if (obj.userRoles.length > 0) {
					if (this.UserIDToUpdate == null) {
						if (await this.checkAdminExist()) {
							this.createUser(obj);

						}
						else {
							this.popupService.openAlertDialog("The application does not currently have a user with access to the Admin screens. Please create a user with full access to the Admin screens before proceeding with the creation of other users.", "Users", "check_circle", true);
						}
					}
					else if (this.UserIDToUpdate != null && (this.isChangesExists || this.isUserNameChanged || this.isRoleChangesExists)) {
						this.updateUser(this.createObj());
					}
				}
				else {
					this.popupService.openAlertDialog("Please add atleast one role.", "Users", "check_circle", false);
				}
			}
		}
		else {
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Users", "check_circle", false);
		}
	}
	createObj() {
		this.userForm.controls['userName'].enable();
		const user = this.userForm.value;
		user.isActive = (user.isActive === null || user.isActive === "") ? false : user.isActive;
		user.departmentId = (user.departmentId === null || user.departmentId === "" || user.departmentId === undefined) ? 0 : user.departmentId;
		user.cellPhone = (user.cellPhone === null || user.cellPhone === "") ? user.cellPhone : TrimMask.trimMask(user.cellPhone);
		user.userRoles = this.rolesdataSource.data;
		//this.userForm.controls['userName'].disable();
		return user;
	}

	checkIsDataChanged() {
		let dataChanged = false;
		let user = this.createObj();
		if (this.latestRowId != -1) {
			for (var item of this.selectedRow) {
				if (item.firstName === user.firstName &&
					item.lastName === user.lastName &&
					item.locationId == +(user.locationID) &&
					item.departmentId == +(user.departmentId)
					&& this.CheckIsNullOrEmpty(item.emailAddress) === this.CheckIsNullOrEmpty(user.emailAddress)
					&& this.CheckIsNullOrEmpty(user.extension) == this.CheckIsNullOrEmpty(item.extension)
					//	&& this.CheckIsNullOrEmpty(user.initials) == this.CheckIsNullOrEmpty(item.initials) &&
					&& this.CheckIsNullOrEmpty(item.cellPhone) === this.CheckIsNullOrEmpty(user.cellPhone) &&
					item.isActive === user.isActive && this.checkUserRoles()) {
					dataChanged = true;
				}
			}
		}
		else {//dept,location,active

			if ((user.firstName != null && user.firstName.length > 0) || (user.lastName != null && user.lastName.length > 0) || (user.userName != null && user.userName.length > 0) || (user.emailAddress != null && user.emailAddress.length > 0) ||
				(user.extension != null && user.extension.length > 0) || (user.cellPhone != null && user.cellPhone.length > 0) || user.userRoles.length > 0 || (user.locationID != null && user.locationID != 0) || (user.departmentId != null && user.departmentId != 0)||user.isActive!=true) {//||(user.locationID!=null || user.locationID!=0) || (user.departmentId!=null||user.departmentId!=0)
				dataChanged = false;
			}
			else {
				dataChanged = true;
			}

		}

		return dataChanged;
	}

	// Validation for duplicate user name.
	ValidateUser(user: User): boolean {
		this.isValidUser = true;
		this.localUserData.forEach(item => {
			if (this.UserIDToUpdate != null) {
				if ((item.firstName.trim() === user.firstName.trim() &&
					item.lastName.trim() === user.lastName.trim() &&
					item.locationId == +(user.locationID) &&
					item.departmentId == +(user.departmentId)
					&& item.emailAddress.trim() === user.emailAddress.trim()
					&& this.CheckIsNullOrEmpty(user.extension) == this.CheckIsNullOrEmpty(item.extension)
					&& this.CheckIsNullOrEmpty(user.initials) == this.CheckIsNullOrEmpty(item.initials) &&
					item.cellPhone.trim() === user.cellPhone.trim() &&
					item.isActive === user.isActive && this.checkUserRoles()
				)) {
					this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Users", "check_circle", false);
					this.isChangesExists = false;
					this.isRoleChangesExists = false;
					this.isValidUser = false;
					return this.isValidUser;
				}
			}

		});
		return this.isValidUser;
	}
	CheckIsNullOrEmpty(val): string {
		if (val == null || val == "") {
			return "";
		}
		else {
			return val.trim();
		}
	}
	async resetData() {
		let res = this.checkIsDataChanged();
		if (!res) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.clearAutoFilledData();
				this.clearData();
			}
		}
		else {
			this.clearAutoFilledData();
			this.clearData();
		}
	}

	//to clear data.
	clearData() {
		this.highlightedRows.pop();
		this.setFocusUserName();
		this.searchText = "";
		if (!this.isExistInSession) {
			this.selectedoption = 1;
		}
		this.filterData(this.selectedoption, this.searchText, false);
		this.isChangesExists = false;
		this.isRoleChangesExists = false;
	}

	//to check userroles.
	checkUserRoles(): boolean {
		this.isChangeExist = false;
		if (this.localUserRoles.length != this.tempRoles.length) {
			this.isChangeExist = false;
		}
		else {
			if (this.localUserRoles.length == 0 && this.tempRoles.length == 0) {
				this.isChangeExist = true;
			}
			for (var item of this.localUserRoles) {
				for (var val of this.tempRoles) {
					this.isChangeExist = false;
					if (item['roleId'] == val['roleId']) {
						this.isChangeExist = true;
						break;
					}
				}
			}
		}

		return this.isChangeExist;
	}

	selectRowFunctionality(row: any) {
		this.latestRowId = this.dataSource.data.indexOf(row);
		this.setFocus();
		this.myForm.resetForm();
		this.isDialogButtonDiabled = false;
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.loadUserToUpdate(row);
		this.isChangesExists = false;
		this.isRoleChangesExists = false;
		this.userForm.controls['userName'].disable();
		this.selectedUserName = row.userName;
	}

	//Selected row for highlight.
	async selectRow(row: any) {
		let res = this.checkIsDataChanged();
		if (!res) {
			const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (userresponse === "ok") {
				this.selectRowFunctionality(row);
				this.isChangesExists = false;
				this.isRoleChangesExists = false;
			}
		}

		else {
			this.selectRowFunctionality(row);
		}
	}

	//to populate data.
	populateData(row) {
		this.isAdmin = false;
		if (row.userName.toLowerCase() === MessageConstants.ADMINNAME.toLowerCase()) {
			this.isAdmin = true;
		}
		this.userForm.controls['firstName'].setValue(row.firstName);
		this.userForm.controls['lastName'].setValue(row.lastName);
		this.userForm.controls['userName'].setValue(row.userName);
		this.userForm.controls['userName'].disable();
		this.userForm.controls['emailAddress'].setValue(row.emailAddress);
		this.userForm.controls['cellPhone'].setValue(row.cellPhone);
		this.userForm.controls['isActive'].setValue(row.isActive);
		this.userForm.controls['extension'].setValue(row.extension);
		this.userForm.controls['initials'].setValue(row.initials);
		this.departmentArray.forEach(item => {
			if (item.name === row.departmentName) {
				this.userForm.controls['departmentId'].setValue(item.deptID);
			}
		});

		this.locationArray.forEach(loc => {
			if (loc.locationId === row.locationId) {
				this.userForm.controls['locationID'].setValue(loc.locationId);
			}
		});
	}

	tempRoles = [];
	//To load User data to display on fields.
	loadUserToUpdate(row: any) {
		this.isChangesExists = true;
		this.isRoleChangesExists = true;
		this.unAssignedRoles = [];
		this.rolesdataSource.data = [];
		this.checkedRoleList = [];
		this.loadAllRoles();
		this.usersservice.getUserById(row.userName).subscribe(oUser => {
			if (oUser !== null) {
				oUser = oUser[0];
				this.populateData(oUser);
				this.selectedRow.push(oUser);
				this.localUserData = [];
				this.localUserData.push(oUser);
				this.localUserRoles = oUser.userRoles;
				this.UserIDToUpdate = oUser.userId;
				this.rolesdataSource.data = oUser.userRoles;
				this.checkedRoleList = oUser.userRoles;
				this.checkedRoleList.sort((a, b) => (a.roleName.toLocaleLowerCase() > b.roleName.toLocaleLowerCase()) ? 1 : ((b.roleName.toLocaleLowerCase() > a.roleName.toLocaleLowerCase()) ? -1 : 0));
				for (var item of this.rolesList) {
					var isRoleSelected = false;
					for (var role of this.checkedRoleList) {
						if (role.roleId == item.roleId) {
							isRoleSelected = true;
							role.selected = true;
							break;
						}
					}
					if (!isRoleSelected)
						this.unAssignedRoles.push(item)
				}
				this.rolesdataSource.data = this.checkedRoleList;
			}
			else {
				this.populateData(row);
				this.selectedRow.push(row)
				this.unAssignedRoles = this.rolesList;
				this.unAssignedRoles.forEach(role => {
					role.selected = false;
				});
				this.userForm.controls['departmentId'].setValue('');
				this.userForm.controls['locationID'].setValue('');
				this.UserIDToUpdate = null;
			}
			this.setSaveBtnEnable();
		},
			(error) => {
				this.errorService.handleError(error);
			});


		this.usersservice.getUserById(row.userName).subscribe(oUser => {
			if (oUser !== null) {
				this.tempRoles = oUser[0].userRoles;
			}
		},
			(error) => {
				this.errorService.handleError(error);
			})
	}


	// To create new user.
	async createUser(oUser: User) {
		this.usersservice.createUser(oUser).subscribe(res => {
			this.saveData();
		},
			(error) => {
				this.firstNameFocus.nativeElement.focus();
				this.errorService.handleError(error);
			});
	}

	//to save data.
	async saveData() {
		await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Users", "check_circle", false);
		if (Constants.SSO) {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.data = {
				title: "Browser Options",
			};
			const dialogRef = this.dialog.open(BrowserOptionsComponent, dialogConfig);
			dialogRef.afterClosed().subscribe(res => {

			})
			await this.authenticationService.checkAdminExist();
		}

		this.clearAutoFilledData();
		this.loadAllUsers();
		this.setFocusUserName();
	}

	//To update user data.
	async updateUser(oUser: User) {
		oUser.userId = this.UserIDToUpdate;
		this.usersservice.updateUser(oUser).subscribe(() => {
			this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Users", "check_circle", false);
			this.loadAllUsers();
			if (Constants.SSO) {
				this.authenticationService.checkAdminExist();
			}
			this.selectRowFunctionality(this.dataSource.data[this.latestRowId]);
		},
			(error) => {
				this.errorService.handleError(error);
			});
	}

	//To search user table data.
	public doFilter(selectedVal: number, filterValue: string) {
		if ((selectedVal != 0) && (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined)) {
			this.filterData(selectedVal, filterValue, true);
			this.clearAutoFilledData();
		}
		else if ((selectedVal != 0) && (filterValue && filterValue.trim() != "" || filterValue != null || filterValue != undefined)) {
			this.searchText = "";
			this.filterData(this.selectedoption, this.searchText, false);
		}

	}

	filterData(selectedVal: number, filterValue: string, localStorageFlag) {
		if (filterValue.indexOf('*') == -1) {
			filterValue += '*';
		}
		this.dataSource.filterPredicate = (data: any, filter: string) => {
			if (selectedVal == 1) {
				if (this.validateWildCardType(data.userName.toLowerCase(), filterValue.toLowerCase())) {
					return data.userName;
				}
			}
			else if (selectedVal == 2) {
				if (this.validateWildCardType(data.firstName.toLowerCase(), filterValue.toLowerCase())) {
					return data.firstName;
				}
			}

			else if (selectedVal == 3) {
				if (data.departmentName != null) {
					if (this.validateWildCardType(data.departmentName.toLowerCase(), filterValue.toLowerCase())) {
						return data.departmentName;
					}
				}

			}
			else if (selectedVal == 4) {
				if (data.locationDescription != null) {
					if (this.validateWildCardType(data.locationDescription.toLowerCase(), filterValue.toLowerCase())) {
						return data.locationDescription;
					}
				}
			}
			else if (selectedVal == 5) {
				if (data.roleName != null) {
					if (this.validateWildCardType(data.roleName.toLowerCase(), filterValue.toLowerCase())) {
						for (let i = 0; i < data.userRoles.length; i++) {
							if (this.validateWildCardType(data.userRoles[i].roleName.toLowerCase(), filterValue)) {
								return data.roleName;
							}
						}
					}
				}
			}
		}
		this.dataSource.filter = filterValue.trim().toLowerCase();
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;

		if (localStorageFlag) {
			//stroing search criteria to local storage.
			let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
			let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.usersSubmenu) : -1;
			if (index == -1) {
				this.isExistInSession = true;
				searchCriteriaObj.push({ screenName: Constants.usersSubmenu, searchBy: selectedVal });
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
	//Search omits special character.
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

	//Validate Telephone
	validateTelephone(control: FormControl): any {
		let isValidTelephoneNumber = true;
		if (control.value && control.value.indexOf("_") >= 0) {
			isValidTelephoneNumber = false;
			return isValidTelephoneNumber ? null : { 'InvalidTelephone': true };
		}

		return null;
	}

	//Open UnassignedRoles dialog.
	openRolesDialog() {
		const rolesDialog = new MatDialogConfig();
		rolesDialog.disableClose = true;
		rolesDialog.autoFocus = true;
		rolesDialog.width = "350px";
		rolesDialog.data = {
			title: "Add Roles",
			unAssignedRolesFromUser: this.latestRowId == -1 ? this.unAssignedRoles = this.allRolesList : this.unAssignedRoles
			//unAssignedRolesFromUser: this.unAssignedRoles
		};
		const rolesdialogConfig = this.dialog.open(RolesDialogComponent, rolesDialog);
		rolesdialogConfig.afterClosed().subscribe(result => {
			if (result != "close") {
				result.unAssignedRolesFromUser.forEach(item => {
					this.checkedRoleList.push({
						'userrId': 0,
						'roleId': item.roleId,
						'roleName': item.roleName,
						'selected': item.selected
					})
					let index: number = this.unAssignedRoles.findIndex(d => d.roleId === item.roleId);
					this.unAssignedRoles.splice(index, 1);
				})
				this.isRoleChangesExists = true;
				this.checkedRoleList.sort((a, b) => (a.roleName.toLocaleLowerCase() > b.roleName.toLocaleLowerCase()) ? 1 : ((b.roleName.toLocaleLowerCase() > a.roleName.toLocaleLowerCase()) ? -1 : 0));
				this.rolesdataSource.data = this.checkedRoleList;
			}
		});
	}

	//validation to allow only alphabets.
	allowAlphabetsOnly(event) {
		if (event.charCode == 32 || (event.charCode >= 97 && event.charCode <= 122) || (event.charCode >= 65 && event.charCode <= 90))
			return true;
		else
			return false;
	}

	//Space not allowed for email address.
	spaceNotAllowed(event) {
		if (event.keyCode === 32) {
			return false;
		}
	}

	// check for one admin
	async checkAdminExist() {
		let isValid = true;
		if (Constants.SSO) {
			if (JSON.parse(sessionStorage.getItem('AdminExist')) == false) {
				for (let i = 0; i < this.rolesdataSource.data.length; i++) {
					let isFullRoleExist = this.ScreenPrivilegesByRoleId(this.rolesdataSource.data[i].roleId);
					await isFullRoleExist.then(function (result) {
						isValid = result;

					});
					if (isValid) {
						break;
					}

				}

			}
			else {
				isValid = true;
			}
		}
		else {
			isValid = true;
		}
		return isValid;
	}

	async ScreenPrivilegesByRoleId(id) {
		this.initialPrivilageResult = [];
		let roleExist = false;
		var promise = await new Promise((resolve, reject) => {
			this.previlageslist = this.roleScreenService.getScreenPrevillegesByRoleById(id);
			this.previlageslist.subscribe(results => {
				if (!results) { return };
				this.initialPrivilageResult = results;
				if (this.initialPrivilageResult.length > 0) {
					let index = this.initialPrivilageResult.findIndex(x => (x.screenName == Constants.adminScreenName && x.privilege == MessageConstants.FULLPRIVILEGE));

					if (index != -1) {
						roleExist = true;
					}
					else {
						roleExist = false;
					}
					resolve(roleExist);
				}
			},
				(error) => {
					this.errorService.handleError(error);
					reject()
				});

		});
		return roleExist;
	}

	//Dirty flag validation on page leave.
		@HostListener('window:onhashchange')
		canDeactivate(): Observable<boolean> | boolean {
		return this.checkIsDataChanged();
	}
}// User component end here.


