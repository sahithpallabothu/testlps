import { Component, OnInit, ViewChild,QueryList , AfterViewInit, ElementRef, Inject, Injectable,ChangeDetectionStrategy } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatTableDataSource, MatPaginator,ErrorStateMatcher } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { PopupMessageService } from '@/shared/popup-message.service';
import { RunningSummaryService } from '@/businessservices/runningsummary/running-summary.service';
import { Runningsummary } from '@/businessclasses/runningsummary/runningsummary';
import { Observable, empty,fromEvent } from 'rxjs';
import { MessageConstants } from '@/shared/message-constants';
import * as jsPDF from '@/shared/jspdf'; 
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import {DecimalPipe, DatePipe } from '@angular/common';
import { UserPrivilegesService } from '@/_services/userprivilege.service';
import { Constants } from '@/app.constants';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-running-summary',
  // changeDetection : ChangeDetectionStrategy.OnPush,
  templateUrl: './running-summary.component.html',
  styleUrls: ['./running-summary.component.css']
})

export class RunningSummaryComponent implements OnInit {
	spinnerText = MessageConstants.SPINNERTEXT;
	postedList: Observable<Runningsummary[]>;
	unPostedList: Observable<Runningsummary[]>;

	spinerMode ="indeterminate";
	spinnerValue ="80";
	tabIndex:number=0;
	isSaveButtonClicked:boolean=false;
	@ViewChild('picker') searchElement: ElementRef;
	@ViewChildren('focusElement') focusedElement: QueryList<any>;
	public UnPosted_DATA: Runningsummary[] =[]; 

	public Posted_DATA: Runningsummary[] = [];
	
	selectedDate:any;
	TotalPostedPieces='';
	TotalPostedPiecesData='';
	TotalPostedAmount='';
	TotalPostedAmountData='';
	TotalJobs = '';
	TotalOzData ='';
	TotalOzPiecesData ='';
	postedFlag= true;
	datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/',/\d/, /\d/];
	postedDate='';
	displayedColumns: string[] = ['select', 'position', 'jobname', 'pieces', 'amount', 'rundate'];
	postedDataSource = new MatTableDataSource<Runningsummary>();
	unPostedDataSource = new MatTableDataSource<Runningsummary>();
	postedSelection = new SelectionModel<Runningsummary>(true, []);
	unPostedSelection = new SelectionModel<Runningsummary>(true, []);
	RunningSummaryForm:FormGroup;
	hasScreenUpdatePrivilege= false;

	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

  	constructor(private formbulider: FormBuilder,
				private popupService: PopupMessageService,
				private runningSummaryService: RunningSummaryService,
				private errorService: ErrorHandlerService,
				private userPrivilegesService: UserPrivilegesService,
				public datepipe: DatePipe,
				private dp: DecimalPipe) { 
  	}

  	ngOnInit() {
	 
		//check user session
		this.errorService.IsValidUserSession();
		this.RunningSummaryForm = this.formbulider.group({  
			postDate:[, [Validators.required,Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			postDate1:[, []],
			inputname_RunningSummary:[, []],
			location_RunningSummary:["", [Validators.required]],
			trip_RunningSummary:["", [Validators.required,]],
			automatic_chk:[, []],
			options:['A'],
			manual_chk:[, []],
			totalpieces:[, []],
			totalamount:[, []],
			ozpieces:[, []]
			}); 
		this.sortObjects();
		this.RunningSummaryForm.controls["postDate1"].setValue(new Date()); 
		this.setDateToControl('postDate','postDate1');

		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.runningSummaryScreenName)) {
			this.hasScreenUpdatePrivilege = true;
		}
  	}
	public ngAfterContentInit() {
		this.setFocus();
	}

	//set focus on elements
	setFocus(){
		setTimeout(() => {
			this.focusedElement.last.nativeElement.focus();
		}, 500);
	}

	//when select above fields and press submit, validate details and call the reset table method 
	isWinSalem; isAuto; rsTrip;
	LoadTables(){

		let selectedDate = this.RunningSummaryForm.get('postDate').value;
		let dateArray = selectedDate.split("/");
		this.selectedDate = dateArray[0]+"-"+dateArray[1]+"-"+dateArray[2];

		if(this.RunningSummaryForm.valid && this.RunningSummaryForm.get('postDate').value  && this.RunningSummaryForm.get('location_RunningSummary').value && this.RunningSummaryForm.get('trip_RunningSummary').value){
			this.isWinSalem = Number(this.RunningSummaryForm.get('location_RunningSummary').value);
			this.isAuto = this.RunningSummaryForm.get('trip_RunningSummary').value !="M"? 1 : 0;
			this.rsTrip = this.RunningSummaryForm.get('trip_RunningSummary').value;
			this.resetTables(this.selectedDate, this.isWinSalem,this.isAuto,  this.rsTrip); //to load data into tables
			this.isSaveButtonClicked=false;
		}else{
			this.popupService.openAlertDialog("Please select Run Date, Location and Trip."  ,"Running Summary","check_circle");
		}
	}


  	selectedJobObject=[];
	unchangedJobData=[];
	spinnerFlag=0;

  	// load data into objects and tables from web api 
	async resetTables(runDate, isWinSalem, isAuto, trip) {
		this.spinnerFlag=0;
		this.hideSpinner =true;
		this.Posted_DATA=[]; 
		this.UnPosted_DATA = [];
		this.selectedJobObject=[];
		this.unchangedJobData=[];
		//to get unposted details of both automation and manual.
		this.unPostedList = await this.runningSummaryService.getAllJobDetailsData(runDate, isWinSalem, isAuto, 0, trip); // rundate, winsalem, auto or manual, posted or un, trip 
		this.unPostedList.subscribe(results => {
			this.UnPosted_DATA  = results;
			this.sortObjects();
			this.unPostedDataSource = new MatTableDataSource<Runningsummary>(this.UnPosted_DATA);
			this.unPostedSelection = new SelectionModel<Runningsummary>(true, []);
			this.isSaveButtonClicked=false;
			for(let r=0;r<this.UnPosted_DATA.length;r++){
				this.unchangedJobData.push({
					"recordId":this.UnPosted_DATA[r].position,
					"jobNumber": this.UnPosted_DATA[r].jobname,
					"isPosted":this.UnPosted_DATA[r].postflag
				});
			}
			this.spinnerFlag++;
			if(	this.spinnerFlag==2){
				this.hideSpinner = false;
			}

		},	(error) => {
			this.errorService.handleError(error);
			this.hideSpinner = false;
		});
		

		//to get posted details of both automation and manual.
		this.postedList = await this.runningSummaryService.getAllJobDetailsData(runDate, isWinSalem, isAuto, 1, trip);
		this.postedList.subscribe(results => {
			this.Posted_DATA  = results;
			this.sortObjects();
			this.postedDataSource = new MatTableDataSource<Runningsummary>(this.Posted_DATA);
			this.postedSelection = new SelectionModel<Runningsummary>(true, []);
			this.isSaveButtonClicked=false;
			for(let r=0;r<this.Posted_DATA.length;r++){
				this.unchangedJobData.push({
					"recordId":this.Posted_DATA[r].position,
					"jobNumber": this.Posted_DATA[r].jobname,
					"isPosted":this.Posted_DATA[r].postflag
				});
			}
			this.getTotalCount();
			this.spinnerFlag++;
			if(	this.spinnerFlag==2){
				this.hideSpinner = false;
			}
		},(error) => {
			this.errorService.handleError(error);
			this.hideSpinner = false;
		});
		//this.hideSpinner = false;
	}

	// reset all changes in tables when press on reset button on bottom of tables
	async resetTablesOnlyWhilePressBottomResetButton(){
		if(this.checkDirtyFlagValidation()){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
			if (response === "ok") {
				let checkFlagWin = this.isWinSalem == 0 || this.isWinSalem == 1 ? true : false;
				let checkFlagAuto = this.isAuto == 0 || this.isAuto == 1 ? true : false;
				if( this.selectedDate && this.selectedDate.length>0 && checkFlagAuto && checkFlagWin)
					this.resetTables(this.selectedDate, this.isWinSalem,this.isAuto, this.rsTrip )
			}
		}
	}

	//asking confirmation to reset everything in page when press on reset button on top 
  	async resetEverything(resetType){
		if(this.checkDirtyFlagValidation()){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
			if (response === "ok") {
				this.resetFields(resetType);
			}
		}else{
			this.resetFields(resetType);
		}
	}	

	// reset everything in page when press on reset button on top 
	resetFields(resetType){  // parameter is used to reset for 2 conditions i.e when toggle radio button and when press reset button.
		this.postedFlag = true;
		this.unPostedDataSource = new MatTableDataSource<Runningsummary>([]);
		this.unPostedSelection = new SelectionModel<Runningsummary>(true, []);
		this.postedDataSource = new MatTableDataSource<Runningsummary>([]);
		this.postedSelection = new SelectionModel<Runningsummary>(true, []);
		this.selectedJobObject =[];
		this.isSaveButtonClicked=false;
		this.TotalPostedAmount = '0';
		this.TotalPostedPieces = '';
		if(resetType == ''){
			this.RunningSummaryForm.reset(); 
			this.RunningSummaryForm.controls["postDate1"].setValue(new Date()); 
		}
		/* if(resetType != 'trip'){

		}
		this.RunningSummaryForm.controls["postDate1"].setValue(new Date()); */  
		this.checkAutomationOrManual="A";
		this.checkAutomationOrManualTotal="TA";
		this.TotalPostedPiecesData='';
		this.TotalPostedAmountData='';
		this.TotalJobs = '';
		this.TotalOzData ='';
		this.TotalOzPiecesData ='';	
		this.setDateToControl('postDate','postDate1');
	}
  
  	//For calculating totals and pieces and onuces
	getTotalCount() {
		this.TotalPostedPieces="";
		this.TotalOzData ="";
		this.TotalPostedAmount="";
		let tempPieces=0;
		let tempOzData =0;
		let tempPostedAmount =0;
		for(var j = 0; j < this.Posted_DATA.length; j++) {
			let piecesData = this.Posted_DATA[j].pieces;
			tempPieces+= Number(piecesData);
			// this.TotalPostedAmount+= Number((this.Posted_DATA[j].amount).toFixed(1));
			tempPostedAmount+= Number(this.Posted_DATA[j].amount);
			let ozPiecesData = this.Posted_DATA[j]._2Ounces;
			tempOzData+= Number(ozPiecesData);
		}
		this.TotalJobs = this.changeToPiecesFormat(this.Posted_DATA.length);
		this.TotalPostedAmountData= this.changeToAmountFormat(tempPostedAmount);
		this.TotalPostedPieces = this.changeToPiecesFormat(tempPieces );
		this.TotalOzData = this.changeToPiecesFormat(tempOzData);
	}

	/* filter for pieces */
	changeToPiecesFormat(pieces : number):string{
		let formatedPices = this.dp.transform(pieces,'1.0-0');
		return formatedPices;
	}

	//filter for amount
	changeToAmountFormat(amount : number):string{
		let formatedAmount = this.dp.transform(amount,'1.2-2');
		return formatedAmount;
	}
		
	//format the numbers to US Currency
	numberWithCommasUSCurrencyFormat(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	//remove time stamp from datetime
	getDateOnly(pDate){
		var postedDate ="";
		if(pDate == null || pDate == ""){
			postedDate = pDate
		}
		else{
			pDate = new Date(pDate);
			let month = pDate.getMonth() + 1 < 10 ? "0" + (pDate.getMonth() + 1) : pDate.getMonth() + 1;
			let day = pDate.getDate() < 10 ? "0" + pDate.getDate() : pDate.getDate();
			postedDate = month + "/" + day + "/" + String(pDate.getFullYear()).substring(2); //+pDate.getHours()+":"+pDate.getMinutes()+":"+pDate.getSeconds();
		}
		
		return postedDate;
	}

	//To sort the contents in the table.
	sortObjects(){
		 this.Posted_DATA.sort((a,b) => (a.jobname > b.jobname) ? 1 : ((b.jobname > a.jobname) ? -1 : 0)); 
		 this.UnPosted_DATA.sort((a,b) => (a.jobname > b.jobname) ? 1 : ((b.jobname > a.jobname) ? -1 : 0)); 
	}
  
	//move to unposted from posted table
	moveToPosted(){
		if(this.unPostedSelection.selected.length>0){
			for(var i = 0; i < this.unPostedSelection.selected.length; i++) {
				for(var j = 0; j < this.UnPosted_DATA.length; j++) {
					  if(this.UnPosted_DATA[j].position === this.unPostedSelection.selected[i].position){
						   this.Posted_DATA.push(this.unPostedSelection.selected[i]);
						   var removeIndex = this.UnPosted_DATA.findIndex(x => x.position === this.unPostedSelection.selected[i].position);
						  this.UnPosted_DATA.splice(removeIndex, 1);
					  }
				}
			}
		this.maintainSelectedJobDetails(this.unPostedSelection.selected, 1); // 1 means posted
		this.sortObjects();
		this.getTotalCount();
		this.saveButtonsShowHide();
		this.unPostedDataSource = new MatTableDataSource<Runningsummary>(this.UnPosted_DATA);;
		this.postedDataSource = new MatTableDataSource<Runningsummary>(this.Posted_DATA);
		this.postedSelection=new SelectionModel<Runningsummary>(true, []);
		this.unPostedSelection=new SelectionModel<Runningsummary>(true, []);
		
		}
	}
	
	//move to posted from unposted table
	moveToUnPosted(){
		
		if(this.postedSelection.selected.length>0){
			for(var i = 0; i < this.postedSelection.selected.length; i++) {
				for(var j = 0; j < this.Posted_DATA.length; j++) {
					  if(this.Posted_DATA[j].position === this.postedSelection.selected[i].position){
						   this.UnPosted_DATA.push(this.postedSelection.selected[i]);
						   var removeIndex = this.Posted_DATA.findIndex(x => x.position === this.postedSelection.selected[i].position);
						  this.Posted_DATA.splice(removeIndex, 1);
					  }
				}
			}
		this.maintainSelectedJobDetails(this.postedSelection.selected, 0); // 0 means unposted
		this.sortObjects();
		this.getTotalCount();
		this.saveButtonsShowHide();
		this.unPostedDataSource = new MatTableDataSource<Runningsummary>(this.UnPosted_DATA);;
		this.postedDataSource = new MatTableDataSource<Runningsummary>(this.Posted_DATA);
		this.postedSelection=new SelectionModel<Runningsummary>(true, []);
		this.unPostedSelection=new SelectionModel<Runningsummary>(true, []);
		}
	}
	
	// maintain the user selected data while swaping.
	maintainSelectedJobDetails(currentObject, isPosted){
		if(this.selectedJobObject.length>0){
			for(let r=0;r<currentObject.length;r++){
				let jobNotExist = true;
				for(let s=0;s<this.selectedJobObject.length;s++){
					if(currentObject[r].position == this.selectedJobObject[s].recordId){
						this.selectedJobObject[s].isPosted = isPosted;
						jobNotExist = false;
					}
				}
				if(jobNotExist){
					this.selectedJobObject.push({
						"recordId":currentObject[r].position,
						"jobNumber": currentObject[r].jobname,
						"isPosted": isPosted,
						"trip": this.rsTrip,
						"runDate":this.RunningSummaryForm.controls['postDate'].value,
				   });
				}
			}
		}else{
			for(let r = 0;r< currentObject.length;r++){
				this.selectedJobObject.push({
					 "recordId":currentObject[r].position,
					 "jobNumber": currentObject[r].jobname,
					 "isPosted": isPosted,
					 "trip": this.rsTrip,
					 "runDate":this.RunningSummaryForm.controls['postDate'].value,
				});
			}		
		}
	}

	// save buttons disable and enable
	saveButtonsShowHide(){
		if(this.postedDataSource.data.length>0){
			this.postedFlag = true;
		}else{
			this.postedFlag = true;
		}
	}
	
  //// start Un Posted, in table selecting row using checkboxes
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedInUnPosted() {
    const numSelected = this.unPostedSelection.selected.length;
    const numRows = this.unPostedDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleInUnPosted() {
    this.isAllSelectedInUnPosted() ?
        this.unPostedSelection.clear() :
        this.unPostedDataSource.data.forEach(row => this.unPostedSelection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelInUnPosted(row?: Runningsummary): string {
    if (!row) {
      return `${this.isAllSelectedInUnPosted() ? 'select' : 'deselect'} all`;
    }
    return `${this.unPostedSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
//end Un Posted


  //start Posted , in table selecting row using checkboxes
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedInPosted() {
    const numSelected = this.postedSelection.selected.length;
    const numRows = this.postedDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleInPosted() {
    this.isAllSelectedInPosted() ?
        this.postedSelection.clear() :
        this.postedDataSource.data.forEach(row => this.postedSelection.select(row));
		
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelInPosted(row?: Runningsummary): string {
    if (!row) {
      return `${this.isAllSelectedInPosted() ? 'select' : 'deselect'} all`;
    }
    return `${this.postedSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
 //end Posted

	hideSpinner = false;
	hideOZPieces= false; 
	checkAutomationOrManual="A";
	checkAutomationOrManualTotal="TA";
	//radio buttons click event automation and manual ask confirmation for dirty flags
	async tripChange(event){
		 if(this.checkDirtyFlagValidation()){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
			if (response === "ok") { 	
				this.toggleAutoOrManual(event);
			}else{
				this.RunningSummaryForm.controls["trip_RunningSummary"].setValue(this.rsTrip); 
			}
		}else{
			this.toggleAutoOrManual(event);
		}
	} 

	//radio buttons click event
	toggleAutoOrManual(event){
		this.setManualAutomationTableColumns(event.value);
		this.resetFields("trip");
		if(event.value==="M"){
			this.hideOZPieces= true;
			this.checkAutomationOrManual="M";
			this.checkAutomationOrManualTotal="TM";
			//this.RunningSummaryForm.controls["options"].setValue('M');  
		}else{
			this.hideOZPieces= false;
			this.checkAutomationOrManual="A";
			this.checkAutomationOrManualTotal="TA";
			//this.RunningSummaryForm.controls["options"].setValue('A');  
		}
	}

	//show hide 2 Ounces column, while toggle radio buttons
	setManualAutomationTableColumns(checkedValue:any):void{
		if(checkedValue==="M"){
			this.displayedColumns = ['select', 'position', 'jobname', 'pieces', 'amount','rundate','2ozPieces'];
		}else{
			this.displayedColumns = ['select', 'position', 'jobname', 'pieces', 'amount','rundate'];
		}
	}

	//save the selected changes into db
	async SaveChanges(){
		await this.runningSummaryService.updateJobPostFlag(this.finalJobObject).subscribe(() => {
			if(this.postedDataSource.data.length>0){
				this.makeExportObjectData("txt");
			}
			this.popupService.openAlertDialog("Record(s) updated successfully.", "Running Summary", "check_circle", false);
			this.selectedJobObject=[];
			this.finalJobObject=[];
			this.resetTables(this.selectedDate, this.isWinSalem,this.isAuto, this.rsTrip ); //to load data into tables
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}

	//dirty flag validation 
	finalJobObject=[];
	checkDirtyFlagValidation(){
		this.finalJobObject=[];
		let changesExist = false;
		for(let r=0;r<this.selectedJobObject.length;r++){
			let isSelectedPosted = this.selectedJobObject[r].isPosted===1 ? true: false;
			for(let s=0;s<this.unchangedJobData.length;s++){
				if(this.selectedJobObject[r].recordId == this.unchangedJobData[s].recordId && isSelectedPosted != this.unchangedJobData[s].isPosted){
					this.finalJobObject.push(this.selectedJobObject[r]);
					changesExist = true;
				}
			}
		}
		return changesExist;
	}

	//check changes exist or not and call the savechanges() method
	selectedTableData:any;
	filename="runningsummary.txt";
	type="text/plain";
	
	exportTableData(){
		//this.finalJobObject
		if(this.checkDirtyFlagValidation()){
			this.SaveChanges();
		}else{
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Running Summary", "check_circle", false);
		}	
	}
	
	// ready the export object for text file and pdf file.
	makeExportObjectData(fileType){
		if(this.postedDataSource.data.length>0){
			//	this.hideSpinner = true;
				this.selectedTableData="";
				var todaysDate = new Date();
				let currentMonth = todaysDate.getMonth()+1;
				let currentDay = todaysDate.getDate();
				let currentYear =""+todaysDate.getFullYear();
					currentYear=currentYear.substr(2);
				let currentHour = todaysDate.getHours();
				let currentMin = todaysDate.getMinutes();
				let currentSec = todaysDate.getSeconds();
				let trip = this.RunningSummaryForm.get('trip_RunningSummary').value
				//this.filename = "RunningSummary_"+currentMonth+"-"+currentDay+"-"+currentYear+this.checkAutomationOrManual+"_"+currentHour+currentMin+currentSec+".txt";
				this.filename = currentMonth+"-"+currentDay+"-"+currentYear+" "+currentHour+currentMin+currentSec+" "+trip+this.checkAutomationOrManual+".txt";
				//RunningSummary_5-15-2019A_184031
				this.selectedTableData+= currentMonth+"/"+currentDay+"/"+currentYear+"\n";
				this.currentDate = currentMonth+"/"+currentDay+"/"+currentYear;
				// this.selectedTableData+= currentMonth+"-"+currentDay+"-"+currentYear+"\n";
				let totalExportPieces=0;
				let totalExportAmount = 0;
				let totalExportOunces = 0;
				for(var i = 0; i < this.postedDataSource.data.length; i++) {
					
						this.selectedTableData += this.checkAutomationOrManual+", "+
													this.postedDataSource.data[i].jobname +", "+
													this.changeToPiecesFormat(this.postedDataSource.data[i].pieces) +", "+
													this.changeToAmountFormat(this.postedDataSource.data[i].amount) +", "+
													this.getDateOnly(this.postedDataSource.data[i].rundate);
						this.selectedTableData += this.checkAutomationOrManual=="A" ? "": ", "+this.changeToPiecesFormat(this.postedDataSource.data[i]._2Ounces);
						this.selectedTableData +="\n";
						let p = this.postedDataSource.data[i].pieces;
						totalExportPieces+= Number(p);
						totalExportAmount+= Number(this.postedDataSource.data[i].amount);		
						totalExportOunces+= Number(this.postedDataSource.data[i]._2Ounces);		
				}
				
				this.selectedTableData += 	this.checkAutomationOrManualTotal +", "+this.changeToPiecesFormat(totalExportPieces)+", "+ this.changeToAmountFormat(totalExportAmount);
				this.selectedTableData += 	this.checkAutomationOrManual=="A" ? "": ", "+this.changeToPiecesFormat(totalExportOunces);
				if(fileType =="txt"){
				//	this.downloadTextFile();
				}
				this.isSaveButtonClicked=false;
			}
	}


	//export data as pdf when press review / print button
	currentDate:string;
	async exportDataAsPDF(){
		//await this.makeExportObjectData("pdf");
		if(!this.checkDirtyFlagValidation()){
		if(this.RunningSummaryForm.valid){
			if(this.RunningSummaryForm.get('postDate').value != "" && this.RunningSummaryForm.get('location_RunningSummary').value!=-1 && this.RunningSummaryForm.get('trip_RunningSummary').value!=-1 && this.RunningSummaryForm.get('location_RunningSummary').value && this.RunningSummaryForm.get('trip_RunningSummary').value){
				var todaysDate = new Date();
				let currentMonth = todaysDate.getMonth()+1;
				let currentDay = todaysDate.getDate();
				let currentYear = ""+todaysDate.getFullYear();
				currentYear=currentYear.substr(2);
				let currentHour = todaysDate.getHours();
				let currentMin = todaysDate.getMinutes();
				let currentSec = todaysDate.getSeconds();
				let trip = this.RunningSummaryForm.get('trip_RunningSummary').value;
		
				this.filename = currentMonth+"-"+currentDay+"-"+currentYear+" "+currentHour+currentMin+currentSec+" "+trip+this.checkAutomationOrManual+".txt";
				this.currentDate = currentMonth+"/"+currentDay+"/"+currentYear;
				var doc = new jsPDF();
				doc.setProperties({
					title: 'Running Summary',
					subject: 'Posted Data Report',
					author: 'LPS',
					creator: 'Arista LPS'
				});
				doc.setFontSize(10);
				doc.setTextColor(175, 171, 171);
				doc.text("Printed on "+ new Date().toLocaleString(), 150, 5);
				
				var img = new Image()
				img.src = 'assets/AristaCMYK_Bevel_with_Full_Name.jpg'
				doc.addImage(img, 'JPEG', 26, 7, 38, 24);
				doc.setTextColor(0, 0, 0);
				doc.setLineWidth(0.2); // horizontal line
				doc.line(0, 35, 600, 35); 
				doc.setFontSize(13);
				doc.setFontType("bold");
				let a = this.checkAutomationOrManual=="A"?"Automation":"Manual";
				doc.text("Running Summary - "+a, 75, 41); // x,y
				doc.setFontSize(12);
				doc.rect(10,45,190,15);
				doc.setFontType("bold");
				doc.text("Location:", 35, 54);
				doc.setFontType("normal");
				doc.text(this.RunningSummaryForm.get('location_RunningSummary').value==="0"?"Duluth":"Winston-Salem", 56, 54);
				doc.setFontType("bold");
				doc.text("Trip:", 95, 54);
				doc.setFontType("normal");
				doc.text(this.RunningSummaryForm.get('trip_RunningSummary').value, 107, 54);
				doc.setFontType("bold");
				doc.text("Date:", 130, 54);
				doc.setFontType("normal");
				doc.text(this.RunningSummaryForm.get('postDate').value, 142, 54);
				doc.setFontSize(13);
				doc.setFontType("bold");
				doc.text("Running Summary - Operational Procedure, Permit Mailing", 40, 68); // x,y
				doc.setFontSize(12);
				let totalPeices=0, totalAmout=0, totalOunce=0;

				//set column widths
				let piecesColWidth= this.checkAutomationOrManual=="M"?30:45;
				let amountColWidth= this.checkAutomationOrManual=="M"?35:50;
				//set header text widths
				let headerpiecesColWidth= this.checkAutomationOrManual=="M"?93:108;
				let headeramountColWidth= this.checkAutomationOrManual=="M"?126:156;
				//let headerrunDateColWidth= this.checkAutomationOrManual=="M"?145:175;
				let cellYaxisPosition =73;

				let yAxis = 78;
				doc.setFontType("bold");
				//doc.text("S.No", 13, yAxis);
				doc.text("Job Name", 32, yAxis);
				doc.text("Pieces", headerpiecesColWidth, yAxis);
				doc.text("Amount", headeramountColWidth, yAxis);
			
				if(this.checkAutomationOrManual=="M")
					doc.text("2 Ounce", 156, yAxis);
				doc.setFontType("normal");
	
				let i=0;
				for( i = 0; i <=this.postedDataSource.data.length; i++) {
					if(this.postedDataSource.data.length == i)	{
						doc.setFontType("bold");
						doc.setTextColor(255);
					//	doc.cell(10,cellYaxisPosition,15,8,"-",i);	   // width, height, xaxis, yaxis
						doc.setTextColor(40, 55, 98);//doc.setTextColor(0, 0, 0);
						
						doc.cell(30,cellYaxisPosition,50,8,"Total: ",i,"left");	
						doc.cell(30,cellYaxisPosition,0,8,this.changeToPiecesFormat(i),i,"right");	
						doc.cell(30,cellYaxisPosition,piecesColWidth,8,""+this.changeToPiecesFormat(totalPeices),i,"right");	
						doc.cell(30,cellYaxisPosition,amountColWidth,8,""+this.changeToAmountFormat(totalAmout),i,"right");		
						doc.setTextColor(255);
					//	doc.cell(10,cellYaxisPosition,30,8,"-",i);
						
						if(this.checkAutomationOrManual=="M"){
							doc.setTextColor(40, 55, 98);
							doc.cell(30,cellYaxisPosition,30,8,this.changeToPiecesFormat(totalOunce)+"",i,"right");
						}
						
					}else{
						doc.setFontType("normal");
					//	doc.cell(10,cellYaxisPosition,15,8,(i+1)+"",i,"right");	 //index
						doc.cell(30,cellYaxisPosition,50,8,this.postedDataSource.data[i].jobname,i,"left");	 //job number
						doc.cell(30,cellYaxisPosition,piecesColWidth,8,this.changeToPiecesFormat(this.postedDataSource.data[i].pieces),i,"right");	 //pieces
						doc.cell(30,cellYaxisPosition,amountColWidth,8,this.changeToAmountFormat(this.postedDataSource.data[i].amount),i,"right");	//amount
					//	doc.cell(10,cellYaxisPosition,30,8,this.getDateOnly(this.postedDataSource.data[i].rundate),i,"center");	//rundate
						if(this.checkAutomationOrManual=="M")
							doc.cell(30,cellYaxisPosition,30,8,this.changeToPiecesFormat(this.postedDataSource.data[i]._2Ounces),i,"right"); //2ounces

						let p = this.postedDataSource.data[i].pieces;
						totalPeices+= Number(p);
						totalAmout+= Number(this.postedDataSource.data[i].amount);		
						totalOunce+= Number(this.postedDataSource.data[i]._2Ounces);
						
					}	
					if(cellYaxisPosition>290){
					}
				}
				doc.cellInitialize();
				window.open(doc.output('bloburl')); 
				//doc.save(this.filename+'.pdf')
				}else{
						this.popupService.openAlertDialog("Please select Post Date, Location and Trip."  ,"Running Summary","check_circle");
				}
			}
			else{
					this.popupService.openAlertDialog("Invalid Run Date."  ,"Running Summary","check_circle",false);
			}
		}else{
			this.popupService.openAlertDialog("Please save your changes before proceeding to Review / Print."  ,"Running Summary","check_circle",true);
		}
	}
	
	//download text file
	downloadTextFile():void {
		
		var file = new Blob([this.selectedTableData], {type: this.type});
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, this.filename);
		else { // Others
			var a = document.createElement("a"),
			url = URL.createObjectURL(file);
			a.href = url;
			a.download = this.filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);  
			}, 0); 
		}
		this.hideSpinner = false;
	}
		
	// set date to date picker 
	setDateToPicker(controlName1,controlName2){
		let dateToSet: any =new Date(this.RunningSummaryForm.controls[controlName1].value);
		if(dateToSet == "Invalid Date" && this.RunningSummaryForm.controls[controlName1].value != null && this.RunningSummaryForm.controls[controlName1].value != ""){
			this.RunningSummaryForm.controls[controlName2].setValue("");
		}
		else{
			this.RunningSummaryForm.controls[controlName2].setValue(dateToSet);
		}
	}

	//set date to input control
	setDateToControl(controlName1, controlName2){
		var todaysDate = new Date(this.RunningSummaryForm.controls[controlName2].value);
		let currentDate = this.datepipe.transform(todaysDate,MessageConstants.DATEFORMAT).toString();
		this.RunningSummaryForm.controls[controlName1].setValue(currentDate);
	  }
	  
	  public hasError = (controlName: string, errorName: string) =>{
		return this.RunningSummaryForm.controls[controlName].hasError(errorName);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
	 
	  return !this.checkDirtyFlagValidation();
	}
}
