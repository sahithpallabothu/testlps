// Angular components.
import { Component, OnInit, ViewChild, ElementRef, ViewChildren, Inject, QueryList } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog } from "@angular/material";
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Business classes.
import { Contracts, BillingRate, CustomerRate, ContractType, RateType } from '@/businessclasses/Customer/serviceAgreement';

// Business services.
import { ServiceAgreementService } from '../../../businessservices/customer/serviceAgreement.service';
import { UserPrivilegesService } from '@/_services';

// Business components.
import { ContractDialogComponent } from '@/businesscomponents/Customer/contract-dialog/contract-dialog.component';
import { BillingRateDialogComponent } from '@/businesscomponents/Customer/billing-rate-dialog/billing-rate-dialog.component';

// Popup messages. 
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';

//Constants
import { ErrorMatcher } from '@/shared/errorMatcher';
import { MessageConstants } from '@/shared/message-constants';
import { Constants } from '@/app.constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-service-agreement-dialog',
  templateUrl: './service-agreement-dialog.component.html',
  styleUrls: ['./service-agreement-dialog.component.css']
})


export class ServiceAgreementDialogComponent implements OnInit {
  
  //Declarations starts here.
  title: string;
  dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
  startOfEndDate: Date;
  tabIndex = 0;
  serviceagrementForm: FormGroup;
  clientName: string;
  clientCode: string;
  clientID: number;
  customerType: string;
  isChangesExists: boolean = false;
  serviceAgreementFinalObject = {};
  isSavebtnDisable: boolean;
  errorMatcher = new ErrorMatcher();
  totalServiceData = [];
  tempDbData = [];
  //Screen privilege variables.
  hasScreenReadPriviledge: boolean = false;
  hasScreenUpdatePriviledge: boolean = false;
  hasScreenInsertPriviledge: boolean = false;
  hasScreenDeletePriviledge: boolean = false;
  isAllowSave: boolean = false;
  fromHome: boolean = false;
  isRequiredData: boolean = false;
  clientType: boolean;//from db check client type. 
  SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
  enableSaveRequired: boolean = false;
  @ViewChild('focusStartDate') private focusStartDate: ElementRef;
  @ViewChild('focusSystemNumber') private focusSystemNumber: ElementRef;
  isEditCustomer :boolean = false;
  //Declarations ends here.

  constructor(private dialogRef: MatDialogRef<ServiceAgreementDialogComponent>,
    private dialog: MatDialog,
    private errorService: ErrorHandlerService,
    private popupService: PopupMessageService,
    private serviceAgreementService: ServiceAgreementService,
    private datePipe: DatePipe,
    private dp: DecimalPipe,
    private userPrivilegesService: UserPrivilegesService,
    private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) data, ) {
    this.title = data.title;
    this.clientName = data.customerName;
    this.clientCode = data.customerCode;
    this.clientID = data.customerID;
    this.customerType = data.customerType;
    this.fromHome = data.btndisableFromHome;
    this.isSavebtnDisable = data.btndisable;

    //Set Customer screen privileges
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenUpdatePriviledge = true;
    }
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.editCustomerScreenName)) {
			this.hasScreenUpdatePriviledge = true;
			 this.isEditCustomer = true;
		}
    if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenInsertPriviledge = true;
    }
    if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenReadPriviledge = true;
    }
    if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenDeletePriviledge = true;
    }
  }

  ngOnInit() {
    this.serviceagrementForm = this.fb.group({
      //Service 
      serviceAgreementCustomerName: new FormControl({ value: '', disabled: true }),
      serviceAgreementCustomerCode: new FormControl({ value: '', disabled: true }),
      serviceAggStartDate: ['',[Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
      serviceAggStartDateWithPicker: ['', []],
      serviceAggEndDate: ['', [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
      serviceAggEndDateWithPicker: ['', []],
      termNoticeDate: ['', [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
      termNoticeDateWithPicker: ['', []],
      sla: ['', [Validators.pattern(/^[0-9]+$/)]],
      initialTerm: ['', [Validators.pattern(/^[0-9]+$/)]],
      renewalTerm: ['', [Validators.pattern(/^[0-9]+$/)]],
      //General Billing Information
      minChargeAmt: ['', []],
      sedcmbrno: ['', [SpaceValidator.ValidateSpaces]],
      billType: ['', []],
      systemNumber: ['', [SpaceValidator.ValidateSpaces]],
      PGBillRate: ['', []],
      CSBillRate: ['', []],
      NonAutoFeeRate: ['', []],
      PDFProcessingFee: ['', []],
      EBPPProcessingRate: ['', []],

    });

    this.GetServiceAgreement(this.clientID);
    this.setSaveBtnEnable()
    // if (this.fromHome) {
    //   this.EnableOrDisableFormControls(false);
    // }

    this.setFocus();
  }

  // Used to set the focus for the first field.
  setFocus(focusFlag:boolean = false) {
    setTimeout(() => { // this will make the execution after the above boolean has changed
      if(focusFlag){
        this.focusSystemNumber.nativeElement.focus();
      }else{
        this.focusStartDate.nativeElement.setSelectionRange(this.focusStartDate.nativeElement.value.length, this.focusStartDate.nativeElement.value.length);
        this.focusStartDate.nativeElement.focus();
      }   
    }, 300);
  }

  //validate spaces 
  validateSpaces(key) {
    key.srcElement.value = key.srcElement.value.trim();
  }

  //To check form field change or not.
  isChange() {
    this.isChangesExists = true;
  }

  //To check bill type change or not.
  billTypeChange() {
    this.isChangesExists = true;
    this.setFocus(true);
  }

  //To open from other screen, Enable Or Disable Form Controls.  
  EnableOrDisableFormControls(isEnable: Boolean = true) {
    for (var control in this.serviceagrementForm.controls) {
      if (control != "serviceAgreementCustomerName" && control != "serviceAgreementCustomerCode") {
        isEnable ? this.serviceagrementForm.controls[control].enable() : this.serviceagrementForm.controls[control].disable();
      }
    }
  }

  //To set Save button enable based on privilage. 
  setSaveBtnEnable() {
    if (this.hasScreenUpdatePriviledge) {
      this.isAllowSave = true;    
    }else {
      this.isAllowSave = false;
    }
    this.EnableOrDisableFormControls(this.isAllowSave );
  }

  //To get Service Agreement data by client ID.
  GetServiceAgreement(clientID: number) {
    this.serviceAgreementService.getClientServiceAgreement(clientID).subscribe(results => {
      if (results.length) {
        this.clientType = results[0].clientType;
        this.totalServiceData = results;
        if (results[0].clientID) {
          if (results[0].startDate != "" && results[0].startDate != null && results[0].startDate != "0001-01-01T00:00:00" && results[0].startDate != "Invalid Date") {
            this.serviceagrementForm.controls['serviceAggStartDate'].setValue(this.datePipe.transform(new Date(results[0].startDate), MessageConstants.DATEFORMAT).toString());
            this.serviceagrementForm.controls['serviceAggStartDateWithPicker'].setValue(new Date(results[0].startDate));
            this.startOfEndDate = new Date(results[0].startDate);
          } 
          if (results[0].endDate != "" && results[0].endDate != null && results[0].endDate != "0001-01-01T00:00:00" && results[0].endDate != "Invalid Date") {
            this.serviceagrementForm.controls['serviceAggEndDate'].setValue(this.datePipe.transform(new Date(results[0].endDate), MessageConstants.DATEFORMAT).toString());
            this.serviceagrementForm.controls['serviceAggEndDateWithPicker'].setValue(new Date(results[0].endDate));
          }
          if (results[0].termNoticeDate != "" && results[0].termNoticeDate != null && results[0].termNoticeDate != "0001-01-01T00:00:00" && results[0].termNoticeDate != "Invalid Date") {
            this.serviceagrementForm.controls['termNoticeDate'].setValue(this.datePipe.transform(new Date(results[0].termNoticeDate), MessageConstants.DATEFORMAT).toString());
            this.serviceagrementForm.controls['termNoticeDateWithPicker'].setValue(new Date(results[0].termNoticeDate));
          }

          this.serviceagrementForm.controls['sla'].setValue(results[0].sla == 0 ? "" : results[0].sla);
          this.serviceagrementForm.controls['initialTerm'].setValue(results[0].initialTerm == 0 ? "" : results[0].initialTerm);
          this.serviceagrementForm.controls['renewalTerm'].setValue(results[0].renewalTerm == 0 ? "" : results[0].renewalTerm);

          this.serviceagrementForm.controls['minChargeAmt'].setValue(results[0].minChargeAmt == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(results[0].minChargeAmt, '1.4-4'));
          this.serviceagrementForm.controls['sedcmbrno'].setValue(results[0].sedcmbrno == 0 ? "" : results[0].sedcmbrno);
          this.serviceagrementForm.controls['billType'].setValue(results[0].billType);
          this.serviceagrementForm.controls['systemNumber'].setValue(results[0].systemNumber);

          this.serviceagrementForm.controls['PGBillRate'].setValue(results[0].pgBillRate == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(results[0].pgBillRate, '1.4-4'));
          this.serviceagrementForm.controls['CSBillRate'].setValue(results[0].csBillRate == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(results[0].csBillRate, '1.4-4'));
          this.serviceagrementForm.controls['NonAutoFeeRate'].setValue(results[0].nonAutoFeeRate == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(results[0].nonAutoFeeRate, '1.4-4'));
          this.serviceagrementForm.controls['PDFProcessingFee'].setValue(results[0].pdfProcessingFee == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(results[0].pdfProcessingFee, '1.4-4'));
          this.serviceagrementForm.controls['EBPPProcessingRate'].setValue(results[0].ebppProcessingRate == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(results[0].ebppProcessingRate, '1.4-4'));

          //To check required fields have data or not for update remaining data.
          if (results[0].startDate !="" && results[0].startDate != null && results[0].startDate != "0001-01-01T00:00:00" && results[0].startDate != "Invalid Date"
            && results[0].endDate !="" && results[0].endDate != null && results[0].endDate != "0001-01-01T00:00:00" && results[0].endDate != "Invalid Date"
          ) {
            this.isRequiredData = true;
          }
        }
      }
    },
      (error) => {
        this.errorService.handleError(error);
      });
  }

  //To check Dates.
  checkForValidDates(cntrl1, cntrl2) {
    this.isChangesExists = true;
    let tempDateVal = this.checkForStartAndEndDate();  
  }

  //on Form Submit data.
  async onFormSubmit() {
    const serviceAgreementData = this.serviceagrementForm.value;
    let serviceFinalObject = this.buildFinalFormObject(serviceAgreementData);
    serviceFinalObject.endDate = serviceFinalObject.endDate == null || serviceFinalObject.endDate == "01/01/1970" ? "" : serviceFinalObject.endDate
    serviceFinalObject.startDate = serviceFinalObject.startDate == null || serviceFinalObject.startDate == "01/01/1970" ? "" : serviceFinalObject.startDate
    serviceFinalObject.termNoticeDate = serviceFinalObject.termNoticeDate == "" || serviceFinalObject.termNoticeDate == null || serviceFinalObject.termNoticeDate == "01/01/1970" ? null : serviceFinalObject.termNoticeDate
    let flag = await this.dirtyFlagValidation(this.totalServiceData, serviceFinalObject);
    serviceFinalObject.termNoticeDate = serviceFinalObject.termNoticeDate == "" || serviceFinalObject.termNoticeDate == null || serviceFinalObject.termNoticeDate == "01/01/1970" ? null : serviceFinalObject.termNoticeDate
    if (flag && this.isChangesExists) {
      if (serviceFinalObject.startDate != '' && serviceFinalObject.endDate != '' && this.isChangesExists) {
        if (this.checkForStartAndEndDate()) {
          this.updateServiceAgreement(serviceFinalObject);
        } else {
          this.popupService.openAlertDialog(MessageConstants.ENDDATE_GREATER, "Service Agreement", "check_circle", false);
        }
      }
      else {
        this.updateServiceAgreement(serviceFinalObject);
      }
    }
    else {
      this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Service Agreement", "check_circle", false);
    }
  }

  //To build service agreement Final Object.
  buildFinalFormObject(serviceAgreementData): any {
    serviceAgreementData.clientID = this.clientID;
    serviceAgreementData.minChargeAmt = (serviceAgreementData.minChargeAmt === null || serviceAgreementData.minChargeAmt === "" || serviceAgreementData.minChargeAmt === undefined) ? 0 : serviceAgreementData.minChargeAmt
    // object building
    this.serviceAgreementFinalObject = {
      clientID: serviceAgreementData.clientID,
      startDate: serviceAgreementData.serviceAggStartDateWithPicker == "" || serviceAgreementData.serviceAggStartDateWithPicker == "Invalid Date" ? serviceAgreementData.serviceAggStartDate : this.datePipe.transform(new Date(serviceAgreementData.serviceAggStartDateWithPicker), 'MM/dd/yyyy').toString(),
      endDate: serviceAgreementData.serviceAggEndDateWithPicker == "" || serviceAgreementData.serviceAggEndDateWithPicker == "Invalid Date" ? serviceAgreementData.serviceAggEndDate : this.datePipe.transform(new Date(serviceAgreementData.serviceAggEndDateWithPicker), 'MM/dd/yyyy').toString(),
      termNoticeDate: serviceAgreementData.termNoticeDateWithPicker == "" || serviceAgreementData.termNoticeDateWithPicker == "Invalid Date" || serviceAgreementData.termNoticeDateWithPicker == null ? null : this.datePipe.transform(new Date(serviceAgreementData.termNoticeDateWithPicker), 'MM/dd/yyyy').toString(),
      sla: serviceAgreementData.sla == "" || serviceAgreementData.sla == null ? 0 : +serviceAgreementData.sla,
      initialTerm: serviceAgreementData.initialTerm == "" || serviceAgreementData.initialTerm == null ? 0 : +serviceAgreementData.initialTerm,
      renewalTerm: serviceAgreementData.renewalTerm == "" || serviceAgreementData.renewalTerm == null ? 0 : +serviceAgreementData.renewalTerm,

      minChargeAmt: +(String(serviceAgreementData.minChargeAmt).replace(/,/g, '')),
      sedcmbrno: serviceAgreementData.sedcmbrno ? serviceAgreementData.sedcmbrno : "",
      billType: serviceAgreementData.billType != undefined && serviceAgreementData.billType != "" && serviceAgreementData.billType != null ? +serviceAgreementData.billType : 0,
      systemNumber: serviceAgreementData.systemNumber ? serviceAgreementData.systemNumber : "",
      pgBillRate: +(String(serviceAgreementData.PGBillRate).replace(/,/g, '')),
      csBillRate: +(String(serviceAgreementData.CSBillRate).replace(/,/g, '')),
      nonAutoFeeRate: +(String(serviceAgreementData.NonAutoFeeRate).replace(/,/g, '')),
      pdfProcessingFee: +(String(serviceAgreementData.PDFProcessingFee).replace(/,/g, '')),
      ebppProcessingRate: +(String(serviceAgreementData.EBPPProcessingRate).replace(/,/g, '')),
    };

    return this.serviceAgreementFinalObject;
  }

  //Validation for dirty Flag.
  async dirtyFlagValidation(unChangedServiceObj, formObj) {
    let keyFlag = true;
    let serviceKeys = Object.keys(formObj);
    if (unChangedServiceObj.length) {
      unChangedServiceObj = unChangedServiceObj[0];
      for (let key of serviceKeys) {
        if (key === 'termNoticeDate') {
          formObj[key] = this.serviceagrementForm.controls['termNoticeDate'].value;
          unChangedServiceObj[key] = this.datePipe.transform(unChangedServiceObj[key], MessageConstants.DATEFORMAT);   
        }
        let customerValueToCompare = (unChangedServiceObj[key] == "" || unChangedServiceObj[key] == undefined) ? null : unChangedServiceObj[key];
        let itemValueToCompare = (formObj[key] == "" || formObj[key] == undefined) ? null : formObj[key];
        if (customerValueToCompare != itemValueToCompare) {
          keyFlag = true;
          break;
        } else {
          keyFlag = false;
        }
      }
    } else {
      keyFlag = true;
    }
    return keyFlag;
  }

  //To create Service Agreement.
  async createServiceAgreement(serviceAgreement) {
    this.serviceAgreementService.createServiceAgreement(serviceAgreement).subscribe(res => {
      this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Service Agreement", "check_circle", false);
      this.resetServiceAgreementForm();
      this.GetServiceAgreement(this.clientID);
    },
      (error) => {
        this.errorService.handleError(error);
      });
  }

  //To update Service Agreement.
  async	updateServiceAgreement(serviceAgreement) {
    await this.serviceAgreementService.updateServiceAgreement(serviceAgreement).subscribe(() => {     
      this.afterUpdate()
    },
    (error) => {
      this.errorService.handleError(error);
    });  
  }

  async afterUpdate(){
    await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Service Agreement", "check_circle", false);
    this.resetServiceAgreementForm();
    this.GetServiceAgreement(this.clientID);
  }

  //To reset Service Agreement Form.
  async resetServiceAgreement() {
    let formData = this.buildFinalFormObject(this.serviceagrementForm.value)
    formData.endDate = formData.endDate == null || formData.endDate == "01/01/1970" ? "" : formData.endDate
    formData.startDate = formData.startDate == null || formData.startDate == "01/01/1970" ? "" : formData.startDate
    formData.termNoticeDate = formData.termNoticeDate=="" || formData.termNoticeDate == null || formData.termNoticeDate == "01/01/1970" ? "": formData.termNoticeDate
    let changeFlag = await this.dirtyFlagValidation(this.totalServiceData, formData);
    if (changeFlag && this.isChangesExists) {
      const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (response === "ok") {
        this.resetServiceAgreementForm();
        this.GetServiceAgreement(this.clientID);
      }
    } else {
     //this.resetServiceAgreementForm();
     // this.GetServiceAgreement(this.clientID);
      this.focusStartDate.nativeElement.focus();
    }
  }

  //To clear Service Agreement Form.
  resetServiceAgreementForm() {
    this.serviceagrementForm.controls['serviceAggStartDate'].setValue(null);
    this.serviceagrementForm.controls['serviceAggStartDateWithPicker'].setValue(null);
    this.serviceagrementForm.controls['serviceAggEndDate'].setValue(null);
    this.serviceagrementForm.controls['serviceAggEndDateWithPicker'].setValue(null);
    this.serviceagrementForm.controls['termNoticeDate'].setValue(null);
    this.serviceagrementForm.controls['termNoticeDateWithPicker'].setValue(null);
    this.serviceagrementForm.controls['sla'].setValue('');
    this.serviceagrementForm.controls['initialTerm'].setValue('');
    this.serviceagrementForm.controls['renewalTerm'].setValue('');
    this.serviceagrementForm.controls['minChargeAmt'].setValue('');
    this.serviceagrementForm.controls['sedcmbrno'].setValue('');
    this.serviceagrementForm.controls['billType'].setValue('');
    this.serviceagrementForm.controls['systemNumber'].setValue('');
    this.serviceagrementForm.controls['PGBillRate'].setValue('');
    this.serviceagrementForm.controls['CSBillRate'].setValue('');
    this.serviceagrementForm.controls['NonAutoFeeRate'].setValue('');
    this.serviceagrementForm.controls['PDFProcessingFee'].setValue('');
    this.serviceagrementForm.controls['EBPPProcessingRate'].setValue('');
    this.serviceagrementForm.markAsUntouched();
    this.serviceagrementForm.clearAsyncValidators();;
    this.isRequiredData = false;
    this.isChangesExists = false;
    this.enableSaveRequired = false;
   // this.startOfEndDate= new Date;
    this.setFocus();
  }

  //To close service agreement dialog.
  async dialogCancel() {
  //  if (!this.fromHome) {
      let formData = this.buildFinalFormObject(this.serviceagrementForm.value)
      formData.endDate = formData.endDate == null || formData.endDate == "01/01/1970" ? "" : formData.endDate
      formData.startDate = formData.startDate == null || formData.startDate == "01/01/1970" ? "" : formData.startDate
      formData.termNoticeDate = formData.termNoticeDate == null || formData.termNoticeDate == "01/01/1970" ? "" : formData.termNoticeDate
      let changeFlag = await this.dirtyFlagValidation(this.totalServiceData, formData);
      if (changeFlag && this.isChangesExists) {
        const response = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
        if (response === "ok") {
          this.dialogRef.close("cancel");
        }
      } else {
        this.dialogRef.close("cancel");
      }
    // } else {
    //   this.dialogRef.close("cancel");
    // }
  }

  //To scroll down.
  scrollToDown() {
    var elmnt = document.getElementById("supmatCardContentMoveSmooth");
    elmnt.scrollIntoView({ behavior: "smooth" });
  }

  //To check mat-errors.
  public hasError = (controlName: string, errorName: string) => {
    return this.serviceagrementForm.controls[controlName].hasError(errorName);
  }

  //To set Start Date to control.
  addserviceAggStartDateEvent() {
    this.isChangesExists = true;
    var todaysDate = new Date(this.serviceagrementForm.controls['serviceAggStartDateWithPicker'].value);
    this.startOfEndDate = todaysDate;
    let currentDate = this.datePipe.transform(todaysDate, MessageConstants.DATEFORMAT).toString();
    this.serviceagrementForm.controls['serviceAggStartDate'].setValue(currentDate);
  }

  //To set end date to control.
  addserviceAggEndDateEvent() {
    this.isChangesExists = true;
    this.endDateValidation(true);
    var todaysDate = new Date(this.serviceagrementForm.controls['serviceAggEndDateWithPicker'].value);
    let currentDate = this.datePipe.transform(todaysDate, MessageConstants.DATEFORMAT).toString();
    this.serviceagrementForm.controls['serviceAggEndDate'].setValue(currentDate);
  }

  //To set Termination Notice Date to control.
  termDateEvent() {
    this.isChangesExists = true;
    var todaysDate = new Date(this.serviceagrementForm.controls['termNoticeDateWithPicker'].value);
    let currentDate = this.datePipe.transform(todaysDate, MessageConstants.DATEFORMAT).toString();
    this.serviceagrementForm.controls['termNoticeDate'].setValue(currentDate);
  }

  //validation to select start date before selecting end date.
  endDateValidation(checkFlag: boolean) {
    if (this.serviceagrementForm.controls['serviceAggStartDateWithPicker'].value === null && this.serviceagrementForm.controls['serviceAggStartDate'].value === null
      && this.serviceagrementForm.controls['serviceAggStartDateWithPicker'].value === '' && this.serviceagrementForm.controls['serviceAggStartDate'].value === '') {
      if (checkFlag) {
        this.serviceagrementForm.controls['serviceAggEndDate'].setValue(null);
        this.serviceagrementForm.controls['serviceAggEndDateWithPicker'].setValue('');
        this.popupService.openAlertDialog("Please enter start date before selecting end date. ", "Service Agreement", "check_circle", false);
      }
    }
  }

  //To set end date to datepicker.
  setDateInDatePicker(controlName1, controlName2) {
    this.isChangesExists = true;
    //this.startOfEndDate = new Date;
    let dateToSet: any = new Date(this.serviceagrementForm.controls[controlName1].value);
    if (controlName1 == 'serviceAggEndDate') {
      this.endDateValidation(true);
     
    }
    if(controlName1 == 'serviceAggStartDate' && this.serviceagrementForm.controls[controlName1].value !="" &&
     this.serviceagrementForm.controls[controlName1].value != null  && dateToSet != "Invalid Date"){
      this.startOfEndDate = dateToSet;
    } 
    if (dateToSet == "Invalid Date" || this.serviceagrementForm.controls[controlName1].value == null || this.serviceagrementForm.controls[controlName1].value == "" ) {
      this.serviceagrementForm.controls[controlName2].setValue("");
    }
    else{
      this.serviceagrementForm.controls[controlName2].setValue(dateToSet);
      this.serviceagrementForm.controls[controlName1].setValue(this.datePipe.transform(dateToSet, "MM/dd/yy"));
    }
   
  }

  //To check start date less than end date.
  checkForStartAndEndDate() {
    if ((this.serviceagrementForm.controls['serviceAggStartDate'].value !== null &&
      this.serviceagrementForm.controls['serviceAggStartDate'].value !== '' && this.serviceagrementForm.controls['serviceAggStartDate'].value) != 'Invalid Date' &&
      (this.serviceagrementForm.controls['serviceAggEndDate'].value !== null &&
        this.serviceagrementForm.controls['serviceAggEndDate'].value !== '')) {
      if (new Date(this.serviceagrementForm.controls['serviceAggEndDate'].value) <
        new Date(this.serviceagrementForm.controls['serviceAggStartDate'].value)) {
        return false;
      }
      return true;
    }
  }

  //To validate Amount fields. 
  validateDecimals(key) {
    let keycode = (key.which) ? key.which : key.keyCode;
    let inputData: string = key.srcElement.value;
    if (inputData.replace(/,/g, '').length < 12) {
      if (inputData.replace(/,/g, '').length == 6 && inputData.indexOf('.') == -1) {
        if (keycode == 46) { return true; }
        else { return false; }
      }
      else {
        if ((keycode == 46 && inputData.indexOf('.') == -1)) { return true; }
        else if (keycode < 48 || keycode > 57) { return false; }
      }
    } else { return false; }
  }

  //To change amount data to required pattern.
  changeToAmount(controlName: string) {
    if (this.serviceagrementForm.controls[controlName].value != null && this.serviceagrementForm.controls[controlName].value != "") {
      let amount1 = (String(this.serviceagrementForm.controls[controlName].value).replace(/,/g, ''));
      if (amount1.length < 13 || this.dp.transform(+amount1, '1.4-4').length < 13) {
        let amount = +amount1;
        this.serviceagrementForm.controls[controlName].setValue(amount == 0 ? this.dp.transform(amount, '1.2-2') : this.dp.transform(amount, '1.4-4'));
        this.enableSaveRequired = false;
      }
      else {
        this.enableSaveRequired = true
      }
    }
  }


  //=====Dialog components=======//

  // To open contract screen.
  async openContract() {
    let TypeOfClient = this.clientType ? "SEDC" : "Arista"
    if (!this.clientName || !this.clientCode) {
      this.popupService.openAlertDialog("Customer Name or Customer Code required", "Service Agreement", "check_circle", false);
    }
    else {
      const contactDialogConfig = new MatDialogConfig();
      contactDialogConfig.disableClose = true;
      contactDialogConfig.autoFocus = false;
      contactDialogConfig.width = "1000px";
      contactDialogConfig.data = {
        title: "Contracts",
        customerName: this.clientName,
        customerCode: this.clientCode,
        customerID: this.clientID,
        customerType: TypeOfClient,
        fromHome: this.fromHome,
      };
      const dialogRef = this.dialog.open(ContractDialogComponent, contactDialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (result != null) { }
      });
    }
  }


  // To open BillingRate screen.
  async openBillingRate() {
    if (!this.clientName || !this.clientCode) {
      this.popupService.openAlertDialog("Customer Name or Customer Code required", "Service Agreement", "check_circle", false);
    }
    else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
      dialogConfig.maxWidth = "1000px";
      dialogConfig.data = {
        title: "Billing Rates",
        customerName: this.clientName,
        customerCode: this.clientCode,
        customerID: this.clientID,
        customerType: this.customerType,
        fromHome: this.fromHome,
      };
      const dialogRef = this.dialog.open(BillingRateDialogComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) { }
      });
    }
  }

}//Component closed here.
