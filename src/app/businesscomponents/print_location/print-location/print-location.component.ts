import { Component, OnInit, ViewChild,QueryList, AfterViewInit, ElementRef, Inject, Injectable,Renderer2 } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChildren } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { PopupMessageService } from '@/shared/popup-message.service';
import { PopupDialogService } from '../../../shared/popup-dialog.service';
import { ApplicationService } from '@/businessservices/application/application.service';
import { ChangePrintLocationService } from '@/businessservices/printlocation/changeprintlocation.service';
import { Application } from '@/businessclasses/Application/application';
import { PrintLocation } from '@/businessclasses/printlocation/printLocation';
import { map, startWith } from 'rxjs/operators';
import { Observable, empty } from 'rxjs';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { InsertsPrintLocationDialogComponent } from '@/businesscomponents/print_location/inserts-print-location-dialog/inserts-print-location-dialog.component';
import { MessageConstants } from '@/shared/message-constants';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { UserPrivilegesService } from '@/_services/userprivilege.service';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';
import { ComponentCanDeactivate } from '../../../_guards/can-deactivate.guard';
export interface PeriodicElement {
	appName: string;
	position: number;
	appCode: string;
	hold: string;
	insert: string;
	auto: string;
	detailed: string;
}

@Component({
	selector: 'app-print-location',
	templateUrl: './print-location.component.html',
	styleUrls: ['./print-location.component.css']
})

export class PrintLocationComponent implements OnInit {
	spinnerText = MessageConstants.SPINNERTEXT;
	hideSpinner = false;
	isChangeColor = false;
	isChangeColorWinsalem = false;
	selectedCharacter = '';
	isvalid = false;
	scrollChangeColor="yes";
	@ViewChildren('focusElement') focusedElement: QueryList<any>;
	@ViewChild('picker') searchElement: ElementRef;
	public Duluth_Data: PrintLocation[] = [];
	public Winston_Salem_Data: PrintLocation[] = [];

	hasScreenUpdatePrivilege= false;

	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	postedFlag = true;
	appCode: string;
	displayedColumns: string[] = ['select', 'position', 'appName', 'appCode', 'hold', 'insert', 'auto', 'detailed'];
	duluthDataSource = new MatTableDataSource<PrintLocation>();
	winstonSalemDataSource = new MatTableDataSource<PrintLocation>();
	winstonSalemSelection = new SelectionModel<PrintLocation>(true, []);
	duluthSelection = new SelectionModel<PrintLocation>(true, []);
	duluthList: Observable<PrintLocation[]>;
	winsalemList: Observable<PrintLocation[]>;
	PrintLocationForm: FormGroup;
	applicationList: Observable<Application[]>;
	filteredOptionsApplicationName: Observable<Application[]>;
	filteredOptionsApplicationCode: Observable<Application[]>;
	applicationArray = [];
	application: Application[] = [];

	constructor(private formbulider: FormBuilder,
		private popupService: PopupMessageService,
		private popupdlgService: PopupDialogService,
		private dialog: MatDialog, private applicationservice: ApplicationService,
		private printlocationservice: ChangePrintLocationService,
		private errorService: ErrorHandlerService,
		private userPrivilegesService: UserPrivilegesService,
		) {
	}

	ngOnInit() {
		
		if(localStorage.getItem("InPrintLocaton")=="Entered"){
			localStorage.removeItem("InPrintLocaton");
			window.location.reload();
		}
		this.PrintLocationForm = this.formbulider.group({
			ApplicationName: [, []],
			ApplicationCode: [, []],
		});

		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.changePrintLocationScreenName)) {
			this.hasScreenUpdatePrivilege = true;
		}
		this.resetTables();
		this.loadApplicationList();
	}

	ngAfterViewInit() {
	}

	//call  the applications service to get all applications to auto complete
	loadApplicationList() {
		this.applicationArray = [];
		this.applicationList = this.applicationservice.getAllApplications();
		this.applicationList.subscribe(results => {
			this.application = results;
			this.applicationArray = results;
			this.application.sort((a, b) => (a.applicationName > b.applicationName) ? 1 : ((b.applicationName > a.applicationName) ? -1 : 0));

			this.initializeAutocompleteApplication();
		});
	}

	//to initialize Application name and code to auto completes
	initializeAutocompleteApplication() {
		this.filteredOptionsApplicationName = this.PrintLocationForm.controls['ApplicationName'].valueChanges
			.pipe(
				startWith<string | Application>(''),
				map(value => typeof value === 'string' ? value : value.applicationName),
				map(applicationname => applicationname ? this._filterApplicationName(applicationname) : this.application.slice())
			);

		this.filteredOptionsApplicationCode = this.PrintLocationForm.controls['ApplicationCode'].valueChanges
			.pipe(
				startWith<string | Application>(''),
				map(value => typeof value === 'string' ? value : value.applicationCode),
				map(ccode => ccode ? this._filterApplicationCode(ccode) : this.application.slice()),
				map(ccode => ccode.sort((a, b) => (a.applicationCode > b.applicationCode) ? 1 : ((b.applicationCode > a.applicationCode) ? -1 : 0)))
			);
	}

	private _filterApplicationName(name: string): Application[] {
		const filterValue = name.toLowerCase();
		return this.application.filter(option => option.applicationName.toLowerCase().indexOf(filterValue) === 0);
	}
	// For Cust code.
	private _filterApplicationCode(name: string): Application[] {
		const filterValue = name.toLowerCase();
		return this.application.filter(option => option.applicationCode.toLowerCase().indexOf(filterValue) === 0);
	}

	displayFnApplicationName(user?: Application): string | undefined {
		return user ? user.applicationName : undefined;
	}

	displayFnApplicationCode(user?: Application): string | undefined {
		return user ? user.applicationCode : undefined;
	}


	//scroll to application position in table when press the submit button
	public doFilter(filterValue: any) {
		if (this.verifyApplicationNameandCode()) {
				let appCode;
				let aCode = this.PrintLocationForm.get('ApplicationCode').value;
				let table = document.getElementById("duluthTable") as HTMLTableElement;
				if(typeof aCode=="object"){
					appCode=aCode.applicationCode
				}else{
					appCode=aCode;
				}

				for (var i = 1, row; row = table.rows[i]; i++) {
					let col = row.cells[3];
					let tempStr = col.innerText;
					
					if (tempStr.toUpperCase().indexOf(appCode.toUpperCase())!==-1) {
						col.scrollIntoView({ behavior: "auto", block: "center", inline: "start" })
					this.winSalemFilterData(appCode);
						break;
					}
				}
				
				this.winSalemFilterData(appCode);
			}
	}

	winSalemFilterData(appCode){
		//let appCode = this.PrintLocationForm.get('ApplicationCode').value;
		let WinSalemtable = document.getElementById("WinSalemTable") as HTMLTableElement;
		for (var i = 1, row; row = WinSalemtable.rows[i]; i++) {
				let col = row.cells[3];
				let tempStr = col.innerText;
				if (tempStr.toUpperCase().indexOf(appCode.toUpperCase())!==-1) {
					col.scrollIntoView({ behavior: "auto", block: "center", inline: "start" })
					break;
				}
			}
	}

	unchangedPrintLocationData=[];
	async resetTables() {
		let i=0;
		this.Winston_Salem_Data = [];
		this.Duluth_Data = [];
		this.selectedApplicationObject=[];
		this.hideSpinner = true;
		//get duluth applications
		this.duluthList = await this.printlocationservice.getAllApplicationsData(0);
		this.duluthList.subscribe(results => {
			this.Duluth_Data  = results;
			this.sortObjects();
			this.duluthDataSource = new MatTableDataSource<PrintLocation>(this.Duluth_Data);
			this.duluthSelection = new SelectionModel<PrintLocation>(true, []);
			for(let r=0;r<this.Duluth_Data.length;r++){
				this.unchangedPrintLocationData.push({
					"isPrintWinSalem":this.Duluth_Data[r].isPrintWinSalem,
					"ApplicationId": this.Duluth_Data[r].position
				});
			}
			i++;
			if(i==2){
				this.hideSpinner = false;
				this.moveToRow('A','WinSalemTable');
				this.moveToRow('A','duluthTable');
			}
		},(error) => {
			this.errorService.handleError(error);
			this.hideSpinner = false;
		});

		//get Winsalem applications
		this.winsalemList = await this.printlocationservice.getAllApplicationsData(1);
		this.winsalemList.subscribe(results => {
			this.Winston_Salem_Data = results;
			 this.sortObjects();
			this.winstonSalemDataSource = new MatTableDataSource<PrintLocation>(this.Winston_Salem_Data);
			this.winstonSalemSelection = new SelectionModel<PrintLocation>(true, []);
			for(let r=0;r<this.Winston_Salem_Data.length;r++){
				this.unchangedPrintLocationData.push({
					"isPrintWinSalem":this.Winston_Salem_Data[r].isPrintWinSalem,
					"ApplicationId": this.Winston_Salem_Data[r].position
				});
			}
			i++;
			if(i==2){
				this.hideSpinner = false;
				this.moveToRow('A','WinSalemTable');
				this.moveToRow('A','duluthTable');
			}
		},(error) => {
			this.errorService.handleError(error);
			this.hideSpinner = false;
		});
	}

	resetFields() {
		this.PrintLocationForm.controls['ApplicationName'].setValue("");
		this.PrintLocationForm.controls['ApplicationCode'].setValue("");
	}

	resetEverything() {
		this.resetTables();
		this.resetFields();
	}

	disabledRow(rowObj) {
		if (rowObj.hold == 'Y' || rowObj.inserts == 'Y')
			return true;
		else
			return false;
	}

	showLink(rowObj) {
		if (rowObj.hold == 'Y' ||  rowObj.inserts == 'Y')
			return "View";
		else
			return "-";
	}

	async openInsertsModal(rowObj, locationFlag) {
		if (rowObj.hold == '' && rowObj.auto == '' && rowObj.inserts== '') {

		}
		else {

			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.height = "600px";
			let tempObj=[], heldReason="";
			if(locationFlag == 2){
				tempObj = this.winstonSalemDataSource.data;
			}else{
				tempObj = this.duluthDataSource.data;
			}
			
			
			dialogConfig.data = {
				inserts2CustomerId:rowObj.insert2Customer,
				appName: rowObj.appName,
				appCode: rowObj.appCode,
				holdCheck: rowObj.hold,
				heldReason: await this.getHeldReason(tempObj, rowObj.appCode),
				title: "Inserts",
				addCustomerDialog: true,
			};
			const dialogRef = this.dialog.open(InsertsPrintLocationDialogComponent, dialogConfig);
		}
	}

	//get held reason
	getHeldReason(tempObj, code){
		let heldReason="";
		for(let i=0;i< tempObj.length;i++){
			if(tempObj[i].appCode == code){
				heldReason = tempObj[i].heldReason;
				break;
			}
		}
		return heldReason;
	}

	//To sort the contents in the table.
	sortObjects() {
		this.Winston_Salem_Data.sort((a, b) => (a.appName.toUpperCase() > b.appName.toUpperCase()) ? 1 : ((b.appName.toUpperCase() > a.appName.toUpperCase()) ? -1 : 0));
		this.Duluth_Data.sort((a, b) => (a.appName.toUpperCase() > b.appName.toUpperCase()) ? 1 : ((b.appName.toUpperCase() > a.appName.toUpperCase()) ? -1 : 0));
	}

	//move ws table from duluth
	moveToWinstonSalem() {
		if (this.duluthSelection.selected.length > 0) {
			for (var i = 0; i < this.duluthSelection.selected.length; i++) {
				for (var j = 0; j < this.Duluth_Data.length; j++) {
					if (this.Duluth_Data[j].position === this.duluthSelection.selected[i].position) {
						this.Winston_Salem_Data.push(this.duluthSelection.selected[i]);
						var removeIndex = this.Duluth_Data.findIndex(x => x.position === this.duluthSelection.selected[i].position);
						this.Duluth_Data.splice(removeIndex, 1);
					}
				}
			}
			this.sortObjects();
			this.maintainSelectedApplications(this.duluthSelection.selected, 1); // 1 means printwinsalem
			this.winstonSalemDataSource = new MatTableDataSource<PrintLocation>(this.Winston_Salem_Data);
			this.duluthDataSource = new MatTableDataSource<PrintLocation>(this.Duluth_Data);
			this.winstonSalemSelection = new SelectionModel<PrintLocation>(true, []);
			this.duluthSelection = new SelectionModel<PrintLocation>(true, []);
			this.resetFields();
		}
	}

	//move duluth table from WS table
	moveToDuluth() {
		if (this.winstonSalemSelection.selected.length > 0) {
			for (var i = 0; i < this.winstonSalemSelection.selected.length; i++) {
				for (var j = 0; j < this.Winston_Salem_Data.length; j++) {
					if (this.Winston_Salem_Data[j].position === this.winstonSalemSelection.selected[i].position) {
						this.Duluth_Data.push(this.winstonSalemSelection.selected[i]);
						var removeIndex = this.Winston_Salem_Data.findIndex(x => x.position === this.winstonSalemSelection.selected[i].position);
						this.Winston_Salem_Data.splice(removeIndex, 1);
					}
				}
			}
			this.sortObjects();
			this.maintainSelectedApplications(this.winstonSalemSelection.selected, 0);  //0 means duluth
			this.duluthDataSource = new MatTableDataSource<PrintLocation>(this.Duluth_Data);
			this.winstonSalemDataSource = new MatTableDataSource<PrintLocation>(this.Winston_Salem_Data);
			this.winstonSalemSelection = new SelectionModel<PrintLocation>(true, []);
			this.duluthSelection = new SelectionModel<PrintLocation>(true, []);
			this.resetFields();
		}
	}

	// maintain applicaiton object which one user selected and change location only
	selectedApplicationObject=[];
	maintainSelectedApplications(currentObject, isPrintWinSalem){
		
		if(this.selectedApplicationObject.length>0){

			for(let r=0;r<currentObject.length;r++){
				let appNotExist = true;
				for(let s=0;s<this.selectedApplicationObject.length;s++){
					if(currentObject[r].position == this.selectedApplicationObject[s].ApplicationId){
						this.selectedApplicationObject[s].isPrintWinSalem = isPrintWinSalem;
						this.selectedApplicationObject.splice(s, 1);
						appNotExist = false;
					}
				}
				if(appNotExist){
					this.selectedApplicationObject.push({
						"ApplicationId":currentObject[r].position,
						"isPrintWinSalem": isPrintWinSalem
				   });
				}
			}

		}else{
			for(let r = 0;r< currentObject.length;r++){
				this.selectedApplicationObject.push({
					 "ApplicationId":currentObject[r].position,
					 "isPrintWinSalem": isPrintWinSalem
				});
			}		
		}		
	}

	saveButtonsShowHide() {
		if (this.duluthDataSource.data.length > 0) {
			this.postedFlag = true;
		} else {
			this.postedFlag = true;
		}
	}

	// start Un Posted
	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelectedInUnPosted() {
		const numSelected = this.duluthSelection.selected.length;
		const numRows = this.winstonSalemDataSource.data.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggleInUnPosted() {
		this.isAllSelectedInUnPosted() ?
			this.duluthSelection.clear() :
			this.winstonSalemDataSource.data.forEach(row => this.duluthSelection.select(row));
	}

	/** The label for the checkbox on the passed row */
	checkboxLabelInUnPosted(row?: PrintLocation): string {
		if (!row) {
			return `${this.isAllSelectedInUnPosted() ? 'select' : 'deselect'} all`;
		}
		return `${this.duluthSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
	}
	//end Un Posted


	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelectedInPosted() {
		const numSelected = this.winstonSalemSelection.selected.length;
		const numRows = this.duluthDataSource.data.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggleInPosted() {
		this.isAllSelectedInPosted() ?
			this.winstonSalemSelection.clear() :
			this.duluthDataSource.data.forEach(row => this.winstonSalemSelection.select(row));
	}

	/** The label for the checkbox on the passed row */
	checkboxLabelInPosted(row?: PrintLocation): string {
	
		if (!row) {
			return `${this.isAllSelectedInPosted() ? 'select' : 'deselect'} all`;
		}
		return `${this.winstonSalemSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
	}
	
	validateApplicationNameAutoCompletes() {
		let ApplicationName = this.PrintLocationForm.get('ApplicationName').value;
		let isFound = false;
		let isempty = false;
		let typeOfvalue = typeof ApplicationName;
		for (let app of this.application) {
			if (typeOfvalue == 'object') {
				if (ApplicationName && app.applicationName.toLowerCase() == ApplicationName.applicationName.toLowerCase()) {
					isFound = true;
					this.PrintLocationForm.controls['ApplicationCode'].setValue({applicationCode: app.applicationCode});
				}
				if (ApplicationName == '') {
					isempty = true;
				}
			} else {
				if (ApplicationName && app.applicationName.toLowerCase() == ApplicationName.toLowerCase()) {
					isFound = true;
					this.PrintLocationForm.controls['ApplicationCode'].setValue({applicationCode: app.applicationCode});
				}
				if (ApplicationName == '') {
					isempty = true;
				}
			}
		}
		if (ApplicationName && isFound == false) {
			this.PrintLocationForm.controls['ApplicationCode'].setValue("");
		}
		if (isempty) {
			this.PrintLocationForm.controls['ApplicationName'].setValue("");
			this.PrintLocationForm.controls['ApplicationCode'].setValue("");
		}
	}

	validateApplicationCodeAutoCompletes() {

		let ApplicationCode = this.PrintLocationForm.get('ApplicationCode').value;
		let isFound = false;
		let isempty = false;
		let typeOfvalue = typeof ApplicationCode;
		for (let app of this.application) {
			if (typeOfvalue == 'object') {
				if (ApplicationCode && app.applicationCode.toLowerCase() == ApplicationCode.applicationCode.toLowerCase()) {
					isFound = true;
					this.PrintLocationForm.controls['ApplicationName'].setValue({applicationName: app.applicationName});
				}
				if (ApplicationCode == '') {
					isempty = true;
				}
			} else {
				if (ApplicationCode && app.applicationCode.toLowerCase() == ApplicationCode.toLowerCase()) {
					this.PrintLocationForm.controls['ApplicationName'].setValue({applicationName: app.applicationName});
					isFound = true;
				}
				if (ApplicationCode == '') {
					isempty = true;
				}
			}
		}
		if (ApplicationCode && isFound == false) {
			this.PrintLocationForm.controls['ApplicationName'].setValue("");
		}
		
		if (isempty) {
			this.PrintLocationForm.controls['ApplicationName'].setValue("");
			this.PrintLocationForm.controls['ApplicationCode'].setValue("");
		}
	}

	// On Application Dropdown change
	isChangeInApplication(event) {
		for (let app of this.application) {
			if (app.applicationCode === event.option.value.applicationCode) {
				this.PrintLocationForm.controls['ApplicationCode'].setValue({ applicationCode: app.applicationCode });
				this.PrintLocationForm.controls['ApplicationName'].setValue({ applicationName: app.applicationName });
			}
		}
	}

	moveToRow(selChar, tableName) {
		
		var flag = 0;
		this.isChangeColor = false;
		this.scrollChangeColor="No";
	
		this.isChangeColorWinsalem = false;
		this.selectedCharacter = selChar;
		let table = document.getElementById(tableName) as HTMLTableElement;
		for (var i = 1, row; row = table.rows[i]; i++) {
			flag = 0;
			let col = row.cells[2];

			let tempStr = col.innerText.charAt(0);
			if (tempStr.toUpperCase() == selChar) {
				col.scrollIntoView({  block: "center", inline: "start" });
				flag = 1;
				break;
			}
		}
	}

	verifyApplicationNameandCode(): boolean {
		let ApplicationName = this.PrintLocationForm.get('ApplicationName').value;
		let ApplicationCode = this.PrintLocationForm.get('ApplicationCode').value;
		let typeOfvalue = typeof ApplicationName;
		let typeOfvalueAppCode = typeof ApplicationCode;
		let isFoundAName = false;
		let isFoundACode = false;
		if(ApplicationName && ApplicationCode){

				for (let app of this.application) {
					
					if (typeOfvalue == 'object') {
						if (app.applicationName.toLowerCase() == ApplicationName.applicationName.toLowerCase()) {
							isFoundAName = true;
						}
					}
					else {
						if (app.applicationName.toLowerCase() == ApplicationName.toLowerCase()) {
							isFoundAName = true;
						}
					}
					if (typeOfvalueAppCode == 'object') {
						if (app.applicationCode .toLowerCase()== ApplicationCode.applicationCode.toLowerCase()) {
							isFoundACode = true;
						}
					}
					else {
						if (app.applicationCode.toLowerCase() == ApplicationCode.toLowerCase()) {
							isFoundACode = true;
						}
					}
				}
		
				if (isFoundACode == true && isFoundAName == true) {
					return this.isvalid = true;
				} else if (isFoundAName == true && isFoundACode == false) {
					this.popupService.openAlertDialog("Invalid Application Code", "Change Print Location", "check_circle",false);
					return this.isvalid = false;
				}
				else if (isFoundACode == true && isFoundAName == false) {
					this.popupService.openAlertDialog("Invalid Application Name", "Change Print Location", "check_circle",false);
					return this.isvalid = false;
				}else {
					this.popupService.openAlertDialog("Invalid Application Name & Application Code", "Change Print Location", "check_circle",false);
					return this.isvalid = false;
				}
			}
	}

	finalApplicationObject=[];
	checkDirtyFlagValidation(){
		let changesExist = false;
		if(this.selectedApplicationObject.length>0){
			changesExist = true;
		}
		return changesExist;
	}

	//save the changes into db
	async SaveChanges()
	{
		if(this.checkDirtyFlagValidation()){
			this.SaveChangesIntoDB();
		}else{
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Change Print Location", "check_circle",false);
		}
	}

	async SaveChangesIntoDB(){
		
		await this.printlocationservice.updatePrintLocation(this.selectedApplicationObject).subscribe(() => {
			this.popupService.openAlertDialog("Record(s) updated successfully.", "Change Print Location", "check_circle",false);
			this.selectedApplicationObject=[];
			this.resetButtonClickEvent();
		},
		(error) => {
			//console.log(error);
		});
	}

	async resetButtonClickEvent(){
		if(this.checkDirtyFlagValidation()){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (response === "ok") {
				this.resetEverything();
			}
		}else{
			this.resetEverything();
		}
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return !this.checkDirtyFlagValidation();
	}
}




