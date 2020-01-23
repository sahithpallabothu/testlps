import { MatSort, MatTableDataSource, MatSelectChange, MatOption, MatPaginator, MatRadioButton, MatRadioGroup, ErrorStateMatcher, MatSelect } from '@angular/material';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Postage } from '../../../businessclasses/Postage/postage';
import { typeOfCharges, Comments } from '../../../businessclasses/Postage/postage';
import { ActivatedRoute } from '@angular/router';
import { PostageService } from '../../../businessservices/postage/postage.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { ChargesDialogComponent } from '@/businesscomponents/Postage/charges-dialog/charges-dialog.component';
import { OuncesDialogComponent } from '../../../businesscomponents/Postage/ounces-dialog/ounces-dialog.component';
import { CommentsDialogComponent } from '../../../businesscomponents/Postage/comments-dialog/comments-dialog.component';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { Location } from '@angular/common';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MessageConstants } from '@/shared/message-constants';
import { ValidateDecimalAndIntegers } from '@/shared/validateDecimalAndIntegers';
import { CustomDateConvertor } from '@/shared/customDateConvertor';
import { Constants } from '@/app.constants';
import { UserPrivilegesService } from '@/_services/userprivilege.service';

import { HostListener } from '@angular/core';
@Component({
	selector: 'app-updatepostage',
	templateUrl: './updatepostage.component.html',
	styleUrls: ['./updatepostage.component.css'],
})
export class UpdatepostageComponent implements OnInit {

	/* mat table columns*/
	tableColumns: string[] = ['chargeType', 'chargeAmount', 'description', 'chargeDate', 'userName'];
	tableColumnsOfComments: string[] = ['jobComments', 'commentsDate', 'userName'];

	panelOpenState: boolean = false;
	isJobNameEntered: boolean = true;
	isSearchVisible: boolean = true;
	highlightedRows = [];
	isCommentTableHasData = true;
	isTableHasData = true;
	arrayOfCharges: typeOfCharges[] = [];
	currentJobNumber: string = "";
	postageDetails: Observable<Postage[]>;
	jobsList: Postage[] = [];
	postagDetailsArray: Postage[] = [];
	commentsArray: Comments[] = [];
	postageid: string;
	datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	isDataEdited: boolean = false;
	isChargesEdited: boolean = false;
	enableButtons: boolean = false;
	showJobsGrid: boolean = false;
	currentJobRunDate = "-1";
	currentRecordId = 0;
	processedFlag = false;

	dataSource = new MatTableDataSource<typeOfCharges>();
	commentsDataSource = new MatTableDataSource<Comments>();

	@ViewChild('sortCharges') sort: MatSort;
	@ViewChild('sortComments') sort1: MatSort;
	@ViewChild('jobNameForFocus') jobNameForFocus;
	@ViewChild('piecesFocus') piecesFocus;

	updatePostageForm: FormGroup;

	hasScreenAdditionalChargeUpdatePriviledge = false;
	hasScreenPostageDeletePriviledge = false;
	hasScreenPostageUpdatetPriviledge = false;
	hasScreenPostageReadPriviledge = false;
	hasScreenAdditionalChargeDeletePriviledge = false;
	hasScreenAdditionalChargeInsertPriviledge = false;
	hasFileAdjustmentPrivilege = false;

	constructor(private formbulider: FormBuilder,
		private postageService: PostageService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private route: ActivatedRoute,
		private _location: Location,
		private element: ElementRef, private dialog: MatDialog,
		private dp: DecimalPipe,
		private dtp: DatePipe,
		private userPrivilegesService: UserPrivilegesService,
	) {

		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.additionalChargesScreenName)) {
			this.hasScreenAdditionalChargeUpdatePriviledge = true;
		}
		if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.additionalChargesScreenName)) {
			this.hasScreenAdditionalChargeInsertPriviledge = true;
		}
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.postageScreenName)) {
			this.hasScreenPostageUpdatetPriviledge = true;
		}
		if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.fileAdjustmentScreenName)) {
			this.hasFileAdjustmentPrivilege = true;
		}
		if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.postageScreenName)) {
			this.hasScreenPostageReadPriviledge = true;
		}
		if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.additionalChargesScreenName)) {
			this.hasScreenAdditionalChargeDeletePriviledge = true;
		}
		if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.postageScreenName)) {
			this.hasScreenPostageDeletePriviledge = true
			this.tableColumnsOfComments = ['jobComments', 'commentsDate', 'userName', 'delete']
		}
	}

	ngOnInit() {

		this.updatePostageForm = this.formbulider.group({
			customerName: [{ value: '', disabled: true }, []],
			customerCode: [{ value: '', disabled: true }, []],
			applicationName: [{ value: '', disabled: true }, []],
			applicationCode: [{ value: '', disabled: true }, []],
			jobName: [{ value: '', disabled: true }, []],
			inputName: [{ value: '', disabled: true }, []],
			runDatepicker: [{ value: '', disabled: true }, []],
			billDatepicker: [{ value: '', disabled: true }, []],
			accountsDetail: [{ value: '', disabled: true }, [Validators.required]],
			accountsInvoice: [{ value: '', disabled: true }, [Validators.required]],
			pagesDetail: [{ value: '', disabled: true }, [Validators.required]],
			pagesInvoice: [{ value: '', disabled: true }, [Validators.required]],
			overflowDetail: [{ value: '', disabled: true }, [Validators.required]],
			overflowInvoice: [{ value: '', disabled: true }, [Validators.required]],
			suppressed: [{ value: '', disabled: true }, [Validators.required]],
			digit5: [{ value: '', disabled: true }, [Validators.required]],
			digit5Amount: [{ value: '', disabled: true }, []],
			aadc: [{ value: '', disabled: true }, [Validators.required]],
			aadcAmount: [{ value: '', disabled: true }, []],
			mixedAADC: [{ value: '', disabled: true }, [Validators.required]],
			mixedAADCAmount: [{ value: '', disabled: true }, []],
			pressorted: [{ value: '', disabled: true }, [Validators.required]],
			pressortedAmount: [{ value: '', disabled: true }, []],
			singlePieces: [{ value: '', disabled: true }, [Validators.required]],
			singlePiecesAmount: [{ value: '', disabled: true }, []],
			postageTotalPieces: [{ value: '', disabled: true }, [Validators.required]],
			postageTotalAmount: [{ value: '', disabled: true }, []],
			globalInsert: [{ value: '', disabled: true }, [Validators.required]],
			selective1: [{ value: '', disabled: true }, [Validators.required]],
			selective2: [{ value: '', disabled: true }, [Validators.required]],
			selective3: [{ value: '', disabled: true }, [Validators.required]],
			selective4: [{ value: '', disabled: true }, [Validators.required]],
			selective5: [{ value: '', disabled: true }, [Validators.required]],
			insertsTotal: [{ value: '', disabled: true }, [Validators.required]],
			pieces: ['', [Validators.required]],
			held: ['', [Validators.required]],
			piecesAmount: [{ value: '', disabled: true }, []],
			heldAmount: [{ value: '', disabled: true }, []],
			foreign: ['', [Validators.required]],
			foreignAmount: [{ value: '', disabled: true }, []],
			oob: ['', [Validators.required]],
			oobAmount: [{ value: '', disabled: true }, []],
			post: ['', []],
			trip: [{ value: '', disabled: true }, []],
			postedDate: [{ value: '', disabled: true }, [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			billedDate: [{ value: '', disabled: true }, [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			postedDate1: [{ value: '', disabled: true }, []],
			postageJobNameForSearch: ['', []],
			billedDatepicker2: [{ value: '', disabled: true }, []],
			printed: new FormControl({ value: '', disabled: true }),

		});

		this.postageid = this.route.snapshot.paramMap.get('id');  // Getting current component's id or information using ActivatedRoute service
		if (this.postageid != null) {
			this.currentJobRunDate = this.route.snapshot.paramMap.get('runDate');
			this.currentRecordId = +(this.route.snapshot.paramMap.get('recordID'));
			let Date1 = this.currentJobRunDate.split('-');
			this.currentJobRunDate = Date1.join('/');
			if (this.currentJobRunDate == null) {
				this.currentJobRunDate = '-1';
			}
			this.currentJobNumber = this.postageid;
			this.isSearchVisible = false;
			this.updatePostageForm.controls["postageJobNameForSearch"].setValue(this.currentJobNumber);
			this.loadAllFileCounts();
		}
		else{this.setFocus(false);}
		this.EnableOrDisableFormControls(false, false);
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): any => {
			if(sortHeaderId == 'chargeDate'){
				return new Date(data.chargeDate);
			}
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};

		this.commentsDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): any => {
			if(sortHeaderId == 'commentsDate'){
				return new Date(data.commentsDate);
			}

			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
	}

	setFocus(focusVariable) {
		
		setTimeout(() => {
			if (focusVariable) {
				this.piecesFocus.nativeElement.focus();
			}
			else {
				this.jobNameForFocus.nativeElement.focus();
			}

		}, 0);
	}

	//open ounces dialog
	jobDetailArray : any;
	async showOuncesDialog() {
		const dialogConfig = new MatDialogConfig();
		//dialogConfig.width = "40%";
		dialogConfig.data = {
			title: "Ounces",
			JobDetailData : this.jobDetailArray,
		};
		const dialogRefOunces = this.dialog.open(OuncesDialogComponent, dialogConfig);
	}

	//open additional charges dialog
	showAdditionalChargesDialog(rowValue) {

		let dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		if (rowValue != "") {

			dialogConfig.data =
				{
					title: "Edit Charge",
					tempData: rowValue,
					isChargesEdited: this.isChargesEdited,
					callFromDblClick: true
				};
		}
		else {
			dialogConfig.data =
				{
					title: "Add Charges",
					tempData: this.arrayOfCharges,
					runDate: this.postagDetailsArray[0].runDate,
					callFromDblClick: false,
				};
		}
		const dialogRef = this.dialog.open(ChargesDialogComponent, dialogConfig);
		dialogRef.afterClosed().subscribe(value => {
			if (value !== "") {
				if (value.isChargesDataEdited) {
					this.isChargesEdited = true;
				}
				if (rowValue != "") {
					for (var i = 0; i < this.arrayOfCharges.length; i++) {

						if (this.arrayOfCharges[i].chargeId === value["chargesData"][0].chargeId) {
							this.arrayOfCharges[i].chargeDate = value["chargesData"][0].chargeDate;
							this.arrayOfCharges[i].feeId = value["chargesData"][0].feeId;
							this.arrayOfCharges[i].chargeAmount = value["chargesData"][0].chargeAmount;
							this.arrayOfCharges[i].description = value["chargesData"][0].description;

						}
					}
				}
				else {
					this.arrayOfCharges = value["chargesData"];
				}
				this.dataSource.data = this.arrayOfCharges;
				this.dataSource.sort = this.sort;
				if (this.dataSource.data.length > 0) {
					this.isTableHasData = true;
				}
				else {
					this.isTableHasData = false;
				}
			}
		});
	}

	//open comments dialog
	showAddComments() {
		let dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = "35%";
		dialogConfig.data =
			{
				title: "Add Comments",
				maxchargeId: this.commentsArray.length > 0 ? Math.max.apply(Math, this.commentsArray.map(function (o) { return o.commentsId; })) : 0,
			};
		const dialogRef = this.dialog.open(CommentsDialogComponent, dialogConfig);
		dialogRef.afterClosed().subscribe(value => {
			if (value !== "") {
				this.isDataEdited = true;
				this.commentsArray.push(value);
				this.commentsDataSource.data = this.commentsArray;
				this.commentsDataSource.sort = this.sort1;
				if (this.commentsDataSource.data.length > 0) {
					this.isCommentTableHasData = true;
				}
				else {
					this.isCommentTableHasData = false;
				}
			}
		});

	}

	scrollToDown() {
		var elmnt = document.getElementById("matCardContentMoveSmooth");
		elmnt.scrollIntoView({ behavior: "smooth" });
	}

	searchData() {
		this.currentJobRunDate = '-1';
		this.showJobsGrid = false;
		this.currentRecordId = 0;
		this.jobsList = [];
		this.loadAllFileCounts();
		
	}

	//load all file counts data
	loadAllFileCounts() {
		this.processedFlag = false;
		if (this.isSearchVisible) {
			this.currentJobNumber = (this.updatePostageForm.controls["postageJobNameForSearch"].value);
		}
		this.resetDataOnInvalid();
		if (this.isSearchVisible) {
			this.updatePostageForm.controls["postageJobNameForSearch"].setValue(this.currentJobNumber);
		}
		if (this.currentJobNumber !== "" && this.currentJobNumber !== null) {
			if (this.currentJobNumber.trim() != "") {
				this.postageDetails = this.postageService.getPostageByJob(this.currentJobNumber, this.currentJobRunDate, this.currentRecordId);
				this.postageDetails.subscribe(results => {
					if (!results) { return };
					this.postagDetailsArray = results;
					if (this.postagDetailsArray.length > 0) {
						if (this.postagDetailsArray.length == 1 || !this.isSearchVisible) {
							this.loadDataIntoControls();
							this.EnableOrDisableFormControls(this.hasScreenPostageUpdatetPriviledge, this.hasFileAdjustmentPrivilege);
							this.enableButtons = true;
							this.setFocus(true);
						}
						else {
							this.jobsList = results;
							this.showJobsGrid = true;
						}
					}
					else {
						this.validateJobName();
					}
				},
					(error) => {
						this.updatePostageForm.markAsUntouched();
						Object.keys(this.updatePostageForm.controls).forEach(key => {
							this.updatePostageForm.controls[key].setErrors(null)
						});
						this.errorService.handleError(error);
					});
			}
			else {
				this.validateJobName();
			}
		}
		else {
			this.validateJobName(true);
		}
	}

	private validateJobName(invalidJob: boolean = false) {
		this.resetDataOnInvalid();
		let msg = invalidJob ? "Please enter Job Name." : "Please enter valid Job Name.";
		this.popupService.openAlertDialog(msg, "File Counts", "check_circle", false);

		if (!invalidJob && this.isSearchVisible) {
			this.updatePostageForm.controls["postageJobNameForSearch"].setValue(this.currentJobNumber);
		}
	}

	resetDataOnInvalid() {
		this.enableButtons = false;
		this.updatePostageForm.reset();
		this.updatePostageForm.markAsUntouched();
		Object.keys(this.updatePostageForm.controls).forEach(key => {
			this.updatePostageForm.controls[key].setErrors(null)
		});
		this.commentsDataSource.data = [];
		this.dataSource.data = [];
		this.isJobNameEntered = true;
	}

	EnableOrDisableFormControls(isEnable: Boolean = true, isPostFlag) {
		for (var control in this.updatePostageForm.controls) {
			if (control == "pieces" || control == "held" || control == "foreign" || control == "oob" ) {
				isEnable ? this.updatePostageForm.controls[control].enable() : this.updatePostageForm.controls[control].disable();
			} 

		}
		if(isPostFlag){
			this.updatePostageForm.controls['post'].enable();
			if(this.postagDetailsArray[0].postFlag){
				this.updatePostageForm.controls['postedDate'].enable();
				this.updatePostageForm.controls['postedDate1'].enable();
				this.updatePostageForm.controls['trip'].enable();
			}
		}
		else{
			this.updatePostageForm.controls['post'].disable();
			this.updatePostageForm.controls['postedDate'].disable();
			this.updatePostageForm.controls['postedDate1'].disable();
			this.updatePostageForm.controls['trip'].disable();
		}
	}

	//pupulate postage data into controls
	loadDataIntoControls() {
		this.updatePostageForm.controls['globalInsert'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].globalInsert));
		this.updatePostageForm.controls['selective1'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].selective1));
		this.updatePostageForm.controls['selective2'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].selective2));
		this.updatePostageForm.controls['selective3'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].selective3));
		this.updatePostageForm.controls['selective4'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].selective4));
		this.updatePostageForm.controls['selective5'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].selective5));
		this.updatePostageForm.controls['insertsTotal'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].insertsTotal));

		this.updatePostageForm.controls['accountsDetail'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].accountsDetail));
		this.updatePostageForm.controls['pagesDetail'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].pagesDetail));
		this.updatePostageForm.controls['overflowDetail'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].overflowDetail));
		this.updatePostageForm.controls['suppressed'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].suppressed));
		this.updatePostageForm.controls['accountsInvoice'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].accountsInvoice));
		this.updatePostageForm.controls['pagesInvoice'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].pagesInvoice));
		this.updatePostageForm.controls['overflowInvoice'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].overflowInvoice));
		this.updatePostageForm.controls['post'].setValue(this.postagDetailsArray[0].postFlag);
		this.postChangeEvent(this.updatePostageForm.controls['post'].value);
		this.updatePostageForm.controls['customerName'].setValue(this.postagDetailsArray[0].customerName);
		this.updatePostageForm.controls['customerCode'].setValue(this.postagDetailsArray[0].customerCode);
		this.updatePostageForm.controls['applicationName'].setValue(this.postagDetailsArray[0].applicationName);
		this.updatePostageForm.controls['applicationCode'].setValue(this.postagDetailsArray[0].applicationCode);
		this.updatePostageForm.controls['jobName'].setValue(this.postagDetailsArray[0].jobName);
		this.updatePostageForm.controls['inputName'].setValue(this.postagDetailsArray[0].jobName);
		if (this.postagDetailsArray[0].printed) {
			this.updatePostageForm.controls['printed'].setValue("Winston-Salem");
		}
		else {
			this.updatePostageForm.controls['printed'].setValue("Duluth");
		}

		this.processedFlag = this.postagDetailsArray[0].processedFlag;
		if (this.processedFlag || !this.hasScreenAdditionalChargeDeletePriviledge) {
			this.tableColumns = ['chargeType', 'chargeAmount', 'description', 'chargeDate', 'userName'];
		}
		else {
			this.tableColumns = ['chargeType', 'chargeAmount', 'description', 'chargeDate', 'userName', 'delete'];
		}

		this.updatePostageForm.controls['trip'].setValue(this.postagDetailsArray[0].uspsTripCode);
		this.updatePostageForm.controls['runDatepicker'].setValue(this.postagDetailsArray[0].runDate);
		if (this.postagDetailsArray[0].billDate != null) {

			this.updatePostageForm.controls['billDatepicker'].setValue(this.postagDetailsArray[0].billDate);
			this.updatePostageForm.controls['billedDatepicker2'].setValue(this.dtp.transform(new Date(this.postagDetailsArray[0].billDate), MessageConstants.DATEFORMAT));
			this.updatePostageForm.controls['billedDate'].setValue(this.postagDetailsArray[0].processedDate != null ? this.dtp.transform(new Date(this.postagDetailsArray[0].processedDate), MessageConstants.DATEFORMAT) : null);
		}
		if (this.postagDetailsArray[0].postDate != null && this.postagDetailsArray[0].postDate != "") {
			this.updatePostageForm.controls['postedDate1'].setValue(new Date(this.postagDetailsArray[0].postDate));
			this.updatePostageForm.controls['postedDate'].setValue(this.dtp.transform(new Date(this.postagDetailsArray[0].postDate), MessageConstants.DATEFORMAT));
		}
		else {
			this.updatePostageForm.controls['postedDate1'].setValue("");
			this.updatePostageForm.controls['postedDate'].setValue("");
		}

		this.updatePostageForm.controls['digit5'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].digit5));
		this.updatePostageForm.controls['aadc'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].aadc));
		this.updatePostageForm.controls['mixedAADC'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].mixedAADC));
		this.updatePostageForm.controls['pressorted'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].pressorted));
		this.updatePostageForm.controls['singlePieces'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].singlePieces));
		this.updatePostageForm.controls['postageTotalPieces'].setValue(this.changeToPiecesFormat(this.calculatePostageTotals()));

		this.updatePostageForm.controls['pieces'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].meterPieces));
		this.updatePostageForm.controls['piecesAmount'].setValue(this.changeToAmountFormat(this.postagDetailsArray[0].meterAmount));
		this.updatePostageForm.controls['held'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].held));
		this.updatePostageForm.controls['foreign'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].foreign));
		this.updatePostageForm.controls['oob'].setValue(this.changeToPiecesFormat(this.postagDetailsArray[0].outOfBalance));



		this.isJobNameEntered = false;
		this.dataSource.data = this.postagDetailsArray[0].additionalCharges;
		this.dataSource.sort = this.sort;
		this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;
		this.arrayOfCharges = this.dataSource.data;
		this.commentsDataSource.data = this.postagDetailsArray[0].comments;
		this.commentsDataSource.sort = this.sort1;
		this.commentsArray = this.postagDetailsArray[0].comments;
		this.isCommentTableHasData = this.commentsDataSource.data.length > 0 ? true : false;
		this.jobDetailArray = this.postagDetailsArray[0];
	}

	// Triggers when post check box is changed.
	postChangeEvent(value) {
		if (value) {
			this.updatePostageForm.controls['postedDate'].enable();
			this.updatePostageForm.controls['postedDate1'].enable();
			this.updatePostageForm.controls['trip'].enable();
		}
		else {
			this.updatePostageForm.controls['postedDate'].disable();
			this.updatePostageForm.controls['postedDate1'].disable();
			this.updatePostageForm.controls['trip'].disable();
			this.updatePostageForm.controls['postedDate'].setValue("");
			this.updatePostageForm.controls['postedDate1'].setValue("");
			this.updatePostageForm.controls['trip'].setValue("");
		}
	}

	//filter to change data into pieces while loading postage data into controls.
	changeToPiecesFormat(pieces: number): string {
		let formatedPices = this.dp.transform(pieces, '1.0-0');
		return formatedPices;
	}

	//filter to change data into amount while loading postage data into controls.
	changeToAmountFormat(amount: number): string {
		let formatedAmount = this.dp.transform(amount, '1.3-3');
		return formatedAmount;
	}

	calculatePostageTotals() : number{
		return (this.postagDetailsArray[0].digit5 != null ? this.postagDetailsArray[0].digit5 :0) +
			   (this.postagDetailsArray[0].aadc != null ? this.postagDetailsArray[0].aadc :0) +
			   (this.postagDetailsArray[0].mixedAADC != null ? this.postagDetailsArray[0].mixedAADC :0) +
			   (this.postagDetailsArray[0].pressorted != null ? this.postagDetailsArray[0].pressorted :0 )+
			   (this.postagDetailsArray[0].singlePieces != null ? this.postagDetailsArray[0].singlePieces :0) ;
	}

	changeInPieces(controlName: string) {
		let pieces = 0;
		if (this.updatePostageForm.controls[controlName].value != null) {
			pieces = +(String(this.updatePostageForm.controls[controlName].value).replace(/,/g, ''));
		}
		this.updatePostageForm.controls[controlName].setValue(this.changeToPiecesFormat(pieces));
	}

	//reset filecounts data.
	async resetPostage() {
		if (this.dirtyFlagValidation() || this.isDataEdited || this.isChargesEdited) {
			const updateConfirmation = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (updateConfirmation === "ok") {
				this.resetData();
				this.loadAllFileCounts();
			}
		}
		else {
			this.resetData();
			this.loadAllFileCounts();
		}
	}

	resetData() {
		this.isJobNameEntered = true;
		this.updatePostageForm.reset();
		this.dataSource.data = [];
		this.commentsDataSource.data = []
		this.setFocus(false);
		this.updatePostageForm.controls["postageJobNameForSearch"].setValue(this.currentJobNumber);
		this.isDataEdited = false;
		this.isChargesEdited = false;
	}

	// navigating to home when back button clicked.
	async backToHome() {
		if (!this.hasScreenPostageUpdatetPriviledge) {
			this._location.back();
			localStorage.setItem("backButtonClicked", 'clicked');
		}
		else {
			if ((this.dirtyFlagValidation() || this.isDataEdited || this.isChargesEdited)) {
				const updateConfirmation = await this.popupService.openConfirmDialog(MessageConstants.BACKMESSAGE, "help_outline");
				if (updateConfirmation === "ok") {
					this.isDataEdited =false; 
					this.isChargesEdited=false;
					this._location.back();
					localStorage.setItem("backButtonClicked", 'clicked');
				}
			}
			else {
				this._location.back();
				localStorage.setItem("backButtonClicked", 'clicked');
			}

		}
	}


	// creating object when form submitted.
	createJobDetailObject() {
		var jobDetailObject = {
			jobName: this.currentJobNumber.toUpperCase(),
			customerCode: this.postagDetailsArray[0].customerCode,
			runDate: this.postagDetailsArray[0].runDate,
			postFlag: this.updatePostageForm.controls['post'].value,
			postDate:this.updatePostageForm.controls['post'].value && (this.updatePostageForm.controls["postedDate"].value != "" && this.updatePostageForm.controls["postedDate"].value != null) ? this.convertToDateFormat(this.updatePostageForm.controls["postedDate1"].value) : null,
			uspsTripCode: this.updatePostageForm.controls["post"].value ? this.updatePostageForm.controls["trip"].value : null,
			additionalCharges: this.getAdditionalCharges(this.arrayOfCharges),
			Comments: this.commentsArray,
			recordID: this.postagDetailsArray[0].recordID,
			meterPieces : this.calculatePostageDetails(this.postagDetailsArray[0].meterPieces, this.updatePostageForm.controls['pieces'].value),
			held : this.calculatePostageDetails(this.postagDetailsArray[0].held,  this.updatePostageForm.controls['held'].value),
			foreign : this.calculatePostageDetails(this.postagDetailsArray[0].foreign, this.updatePostageForm.controls['foreign'].value),
			outOfBalance : this.calculatePostageDetails(this.postagDetailsArray[0].outOfBalance, this.updatePostageForm.controls['oob'].value ),

		}
		return jobDetailObject;
	}

	getAdditionalCharges(arrayOfCharges): any {
		arrayOfCharges.forEach(ac => {
			ac.chargeDate = this.dtp.transform(ac.chargeDate, "MM/dd/yyyy HH:mm:ss").toString()
		})
		return arrayOfCharges;
	}

	convertToDateFormat(pDate): string {
		if(pDate != null && pDate !=""){
			let month = pDate.getMonth() + 1 < 10 ? "0" + (pDate.getMonth() + 1) : pDate.getMonth() + 1;
			let day = pDate.getDate() < 10 ? "0" + pDate.getDate() : pDate.getDate();
			let postedDate = month + "/" + day + "/" + pDate.getFullYear();
			return postedDate;
		}
		else{
			return null;
		}
		
	}

	//removes comma and calcuate the toatal.
	calculatePostageDetails(dbValue, formValue): number {

		if (dbValue !== +(String(formValue).replace(/,/g, ''))) {
			this.isDataEdited = true;
			return dbValue + (+(String(formValue).replace(/,/g, '')) - dbValue);
		}
		return +(String(formValue).replace(/,/g, ''));

	}


	//updating the postage.
	async updateJobDetail() {
		const postageData = this.updatePostageForm.value;
		var jobDetailObject: any;
		if (postageData["post"] && (postageData["postedDate1"] == null || postageData["trip"] == null || postageData["postedDate1"] == "" || postageData["trip"] == "" || postageData["trip"] == "-1")) {
			this.popupService.openAlertDialog("Please enter Posted Date and Trip.", "File Counts", "check_circle", false);
		}
		else {
			jobDetailObject = this.createJobDetailObject();
			if (this.dirtyFlagValidation() || this.isDataEdited ||  this.isChargesEdited) {
				this.postageService.updateJobDetail(jobDetailObject).subscribe(() => {
					this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "File Counts", "check_circle", false);
					this.updatePostageForm.controls["postageJobNameForSearch"].setValue(this.currentJobNumber);
					this.loadAllFileCounts();
					this.isJobNameEntered = true;
					this.isChargesEdited = false;
					this.isDataEdited = false;

				},
					(error) => {
						this.errorService.handleError(error);
					});
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "File Counts", "check_circle", false);
			}
		}
	}

	// dirty flag validation.
	dirtyFlagValidation(): boolean {
		this.createJobDetailObject();
		let isDataChanged = false;
		if(this.hasFileAdjustmentPrivilege){
			let initialPostDate = this.postagDetailsArray[0]['postDate'] === "" || this.postagDetailsArray[0]['postDate'] === null ? null : this.changeToCustomDate(this.postagDetailsArray[0]['postDate']);
			let postDateCurrentValue = this.updatePostageForm.controls['postedDate'].value;
				postDateCurrentValue= postDateCurrentValue == "" ||postDateCurrentValue == null ? null : this.changeToCustomDate(postDateCurrentValue);
			let tripCurrentValue =  this.updatePostageForm.controls['trip'].value == "" ?null:this.updatePostageForm.controls['trip'].value ;
			if (initialPostDate !== postDateCurrentValue || tripCurrentValue !=  this.postagDetailsArray[0].uspsTripCode ||
				this.postagDetailsArray[0].postFlag != this.updatePostageForm.controls['post'].value) {
				isDataChanged = true;
			}
		}
		return isDataChanged;
	}

	//set date to picker from control.
	setDateToPicker(controlName1, controlName2) {
		let dateToSet: any = new Date(this.updatePostageForm.controls[controlName1].value);
		if (dateToSet == "Invalid Date" || this.updatePostageForm.controls[controlName1].value == null || this.updatePostageForm.controls[controlName1].value == "") {

			this.updatePostageForm.controls[controlName2].setValue("");
		}
		else {
			this.updatePostageForm.controls[controlName2].setValue(dateToSet);
			let date = this.dtp.transform( new Date(this.updatePostageForm.controls[controlName2].value),MessageConstants.DATEFORMAT);
			this.updatePostageForm.controls[controlName1].setValue(date);
		}
	}

	//set date to control from picker.
	setDateToControl(controlName1, controlName2) {
		this.updatePostageForm.controls[controlName1].setValue(this.dtp.transform(this.updatePostageForm.controls[controlName2].value, MessageConstants.DATEFORMAT))
	}

	//key press event for amount.
	validateDecimals(key) {
		return ValidateDecimalAndIntegers.validateDecimals(key);
	}

	//key press amount for pieces.
	validateIntegers(key) {
		return ValidateDecimalAndIntegers.validateIntegers(key);
	}

	public hasError = (controlName: string, errorName: string) => {
		return this.updatePostageForm.controls[controlName].hasError(errorName);
	}

	changeToCustomDate(pDate) {
		return CustomDateConvertor.dateConvertor(pDate);
	}

	async deleteAdditionalCharges(row: any) {
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			const index = this.arrayOfCharges.findIndex(x => x.chargeId == row.chargeId);
			if (index > -1) {
				this.arrayOfCharges.splice(index, 1);
				this.dataSource.data = this.arrayOfCharges;
				this.dataSource.sort = this.sort;
				this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
				this.isChargesEdited = true;
			}
		}
	}

	async deletComments(row: any) {
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
		if (userresponse === "ok") {
			const index = this.commentsArray.findIndex(x => x.commentsId == row.commentsId);
			if (index > -1) {
				this.commentsArray.splice(index, 1);
				this.commentsDataSource.data = this.commentsArray;
				this.commentsDataSource.sort = this.sort;
				this.isCommentTableHasData = this.commentsDataSource.data.length > 0 ? true : false;
				this.isDataEdited = true;
			}
		}
	}

	populateDataFromGrid(recordID) {
		let jobIndex = this.jobsList.findIndex(x => x.recordID == recordID);
		this.currentRecordId = recordID;
		this.currentJobRunDate = this.jobsList[jobIndex].runDate.toString();
		this.loadAllFileCounts();
	}

	selectRow(rowValue) {
		this.highlightedRows.pop();
		this.highlightedRows.push(rowValue);
	}

	//Dirty flag validation on page leave.
	@HostListener('window:onhashchange')
	canDeactivate(): Observable<boolean> | boolean {
		if(localStorage.getItem("backButtonClicked")== 'clicked'){
			return true;
		}
		if((!this.isJobNameEntered) && this.postagDetailsArray.length ==1){
		  return !(this.dirtyFlagValidation() || this.isDataEdited || this.isChargesEdited);
		}
			return true;
	}

}
