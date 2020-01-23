// Angular components.
import { Component, OnInit, ViewChild, ElementRef, ViewChildren, Inject, QueryList } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";

import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';


// Business classes.
import { BillingRate, CustomerRate, RateType } from '@/businessclasses/Customer/serviceAgreement';

// Business services.
import { BillingrateService } from '../../../businessservices/customer/billingrate.service';
import { CustomerService } from '../../../businessservices/customer/customer.service';
import { UserPrivilegesService } from '@/_services';
import { FileUploadService } from '@//businessservices/customer/fileUpload.service';
import { RateDescriptionService } from '../../../businessservices/admin/rate-description.service';

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
  selector: 'app-billing-rate-dialog',
  templateUrl: './billing-rate-dialog.component.html',
  styleUrls: ['./billing-rate-dialog.component.css']
})
export class BillingRateDialogComponent implements OnInit {

  //Declarations starts here.
  title: string;
  clientName: string;
  clientCode: string;
  clientID: number;
  billingRateForm: FormGroup;

  isRateUpdate: boolean = false;
  customerRateDetailsList: any = [];
  customerRateDetailTableColumns: string[] = ['description', 'rate'];
  customerRateDetailDataSource = new MatTableDataSource<CustomerRate>();
  currentRateDetailID = null;

  billingRateTableColumns: string[] = ['applicationName', 'applicationCode', 'statementName', 'printOrder', 'consolidationAcc', 'isActive'];
  billingRateDataSource = new MatTableDataSource<BillingRate>();
  billingRateList: any = [];
  currentApplicationID: number = null;
  currentBillingRateAppID: number;
  billingRateFinalObject = {};
  selectedBRDetailsList: any = [];

  highlightedRowsInAssignedApplications = [];
  highlightedRowsInBillingRate = [];
  isRateTypeChangesExists: boolean = false;
  isBillRateObjectChangesExists: boolean = false;
  rateTypes = [];
  filteredOptionsRateTypes: Observable<RateType[]>;
  // Temporary billing rates.
  tempBillingRates = [];
  totalServiceData = [];
  tempDbData = [];

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChild('sortBillingRates') sortBillingRates: MatSort;
  @ViewChild('sortRateDetail') sortRateDetail: MatSort;
  @ViewChild('rate') billRate: ElementRef;

  //Screen privilege variables
  hasScreenReadPriviledge: boolean = false;
  hasScreenUpdatePriviledge: boolean = false;
  hasScreenInsertPriviledge: boolean = false;
  hasScreenDeletePriviledge: boolean = false;
  isAllowSave: boolean = false;
  fromHome: boolean = false;
  public appIndex: Number;
  tabIndex = 0;
  enableRatesWhenBillRate: boolean = false;
  isBillRateChangesExists: boolean = false;
  isstatementactive: boolean = false;
  isEditCustomer :boolean = false;
  isSpace : boolean = false;
  //space message.
  SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

  constructor(private dialogRef: MatDialogRef<BillingRateDialogComponent>,
    private dialog: MatDialog,
    private errorService: ErrorHandlerService,
    private popupService: PopupMessageService,
    private billingrateService: BillingrateService,
    private rateDescriptionService: RateDescriptionService,
    private dp: DecimalPipe,
    private userPrivilegesService: UserPrivilegesService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.title = data.title;
    this.clientName = data.customerName;
    this.clientCode = data.customerCode;
    this.clientID = data.customerID;
    this.fromHome = data.fromHome;
    if (data.btndisable) {
      this.customerRateDetailTableColumns = ['descreption', 'rate'];
      this.billingRateTableColumns = ['applicationName', 'appcode', 'statementname', 'printorder', 'consolidationaccount', 'active'];
    }

    //Set Customer screen privileges
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenUpdatePriviledge = true;
    }
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.editCustomerScreenName)) {
			this.hasScreenUpdatePriviledge = true;
			// this.isEditCustomer = true;
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
    if (this.hasScreenDeletePriviledge && this.hasScreenUpdatePriviledge) {
      this.customerRateDetailTableColumns = ['description', 'rate', 'delete'];
    }
  }


  ngOnInit() {
    this.billingRateForm = this.fb.group({
      //Billing Rate
      appName: [],
      appCode: [],
      statementName: ['', []],
      consolidationAccount: ['', []],
      billingActive: [],
      printOrder: ['', []],
      //Customer Rate Deatails
      billingDescription: [],
      billingRate: ['', []],
    });

    this.enableRatesWhenBillRate = true;
    this.billingRateForm.controls['billingRate'].disable();
    this.billingRateForm.controls['billingDescription'].disable();
    this.billingRateForm.controls['statementName'].disable();
    this.billingRateForm.controls['consolidationAccount'].disable();
    this.billingRateForm.controls['billingActive'].disable();
    this.billingRateForm.controls['appName'].disable();
    this.billingRateForm.controls['appCode'].disable();
    this.billingRateForm.controls['printOrder'].disable();
    this.loadRateTypes();
    this.setSaveBtnEnable();
    this.loadAllBillingRates(this.clientID);

    //To sort based on table header.
    this.customerRateDetailDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase();
      }   
      return data[sortHeaderId];
    };

    this.billingRateDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        if(sortHeaderId === "printOrder" ){
          data[sortHeaderId] = +data[sortHeaderId];
          return data[sortHeaderId];
       }else{
        return data[sortHeaderId].toLocaleLowerCase();
       }        
      }
      
      return data[sortHeaderId];
    };

    // if (this.fromHome) {
    //   this.EnableOrDisableFormControls(false);
    // }
    this.EnableOrDisableFormControls(false);
  }

  //To open from other screen, Enable Or Disable Form Controls.
  EnableOrDisableFormControls(isEnable: Boolean = true) {
    for (var control in this.billingRateForm.controls) {
      if (control != "appName" && control != "appCode") {
        isEnable ? this.billingRateForm.controls[control].enable() : this.billingRateForm.controls[control].disable();
      }
    }
  }

  //To set Save button enable based on privilage. 
  setSaveBtnEnable() {
    if (this.hasScreenUpdatePriviledge) {
      this.isAllowSave = true;    
    } else {
      this.isAllowSave = false;
    }
    this.EnableOrDisableFormControls(this.isAllowSave);
  }


  //To load all rate types descriptions.
  loadRateTypes() {
    this.rateDescriptionService.getAllRateDescriptions().subscribe(results => {
      if (!results) { return };
      this.rateTypes = results;
      this.rateTypes.sort((a, b) => (a.description > b.description) ? 1 : ((b.description > a.description) ? -1 : 0));
    },
    (error) => {
      this.errorService.handleError(error);
    });
  }

  //To load all billing rates based on client ID.
  loadAllBillingRates(clientID: number) {
    this.billingrateService.getBillingRates(clientID).subscribe(results => {
      if (results.length) {
        this.totalServiceData = results;
        this.billingRateDataSource.data = results;
        this.billingRateDataSource.sort = this.sortBillingRates;
        this.billingRateList = results;
        for (let item of results) {
          if (item.customerRateDetails.length > 0) {
            this.customerRateDetailsList.push(item.customerRateDetails);
          }
        }
      }
    },
      (error) => {
        this.errorService.handleError(error);
      });
    this.billingrateService.getBillingRates(clientID).subscribe(results => {
      if (results.length > 0) {
        if (results[0].clientID) {
          this.tempBillingRates = results;
          this.tempDbData = results;
        }
      }
    }, (error) => {
      this.errorService.handleError(error);
    });
  }

  //To check form field change or not.
  isBillRateChange() {
    this.isBillRateChangesExists = true;
    this.isBillRateObjectChangesExists = true;
  }

  //To check form field change or not.
  isChangeRateType() {
    this.isRateTypeChangesExists = false;
    if(this.highlightedRowsInBillingRate.length >0){
        if(this.highlightedRowsInBillingRate[0].rateTypeID != this.billingRateForm.controls['billingDescription'].value.rateTypeID ||
        this.dp.transform(this.highlightedRowsInBillingRate[0].rate ,'1.4-4')  != this.billingRateForm.controls['billingRate'].value ){
          this.isRateTypeChangesExists = true;
        }
    }
    else{
        if( this.currentRateDetailID == null && ((this.billingRateForm.controls['billingDescription'].value && this.billingRateForm.controls['billingDescription'].value.description != null && 
          this.billingRateForm.controls['billingDescription'].value.description !="") ||
          (this.billingRateForm.controls['billingRate'].value != null &&  
          this.billingRateForm.controls['billingRate'].value != "" && 
          this.billingRateForm.controls['billingRate'].value != "0.00"))) {
          this.isRateTypeChangesExists = true;
        }
    }
    return this.isRateTypeChangesExists;
  /*   this.isBillRateObjectChangesExists = true; */
  }

  //To check rate type change or not.
  rateTypeChange() {
    this.isRateTypeChangesExists = true;
    this.isBillRateObjectChangesExists = true;
    this.setFocus();
  }

  //validate spaces 
  validateSpaces(key,controlName) {
    this.isSpace = false; 
    
      if(this.billingRateForm.controls['statementName'].value && (this.billingRateForm.controls['statementName'].value !==this.billingRateForm.controls['statementName'].value.trim())){
        this.isSpace = true;
        this.billingRateForm.controls['statementName'].setErrors({'incorrectSpace': true});
      }
      if(this.billingRateForm.controls['consolidationAccount'].value && (this.billingRateForm.controls['consolidationAccount'].value !==this.billingRateForm.controls['consolidationAccount'].value.trim())){
        this.isSpace = true;
        this.billingRateForm.controls['consolidationAccount'].setErrors({'incorrectSpace': true});      
      }  
  }

  // Used to set the focus for the first field.
  setFocus() {
    setTimeout(() => {
      if (this.billingRateForm.get('billingDescription').value) {
        this.billRate.nativeElement.focus();
        if (this.billingRateForm.get('billingRate').value == 0) {
          this.billingRateForm.controls['billingRate'].setValue('');
        }
      }
    }, 0);
  }

  //To save Billing Rate Details.
  saveCustomerRateDetails() {
    if (this.billingRateForm.get('billingDescription').value != '' && this.billingRateForm.get('billingRate').value != 0 &&
      this.billingRateForm.get('billingDescription').value != null && this.billingRateForm.get('billingRate').value != null) {
      if (this.checkDuplicateCustomerRate(true)) {
        if (this.currentApplicationID != null && this.currentApplicationID != 0) {
          if (!this.isRateUpdate) {
            this.customerRateDetailsList.push(
              {
                'customerRateID': (!this.customerRateDetailsList.length) ? 1 : Math.max.apply(Math, this.customerRateDetailsList.map(function (o) { return o.customerRateID; })) + 1,
                'customerID': this.currentApplicationID,
                'appID': this.currentBillingRateAppID,
                'rateTypeID': this.billingRateForm.get('billingDescription').value.rateTypeID,
                'rate': +(String(this.billingRateForm.get('billingRate').value).replace(/,/g, '')),
                'description': this.billingRateForm.get('billingDescription').value.description
              });
            this.ResetChangesInCustomerRate();
          }
          else {
            for (var i = 0; i < this.customerRateDetailsList.length; i++) {
              if (this.customerRateDetailsList[i].customerRateID === this.currentRateDetailID) {
                this.customerRateDetailsList[i].customerID = this.currentApplicationID;
                this.customerRateDetailsList[i].appID = this.currentBillingRateAppID;
                this.customerRateDetailsList[i].rateTypeID = this.billingRateForm.get('billingDescription').value.rateTypeID;
                this.customerRateDetailsList[i].rate = +(String(this.billingRateForm.get('billingRate').value).replace(/,/g, ''));
                this.customerRateDetailsList[i].description = this.billingRateForm.get('billingDescription').value.description;
              }
            }
            this.ResetChangesInCustomerRate();
          }
        } else {
          this.popupService.openAlertDialog("Please select Application.", "Billing Rates", "check_circle", false);
          this.isBillRateObjectChangesExists = false;
        }

      } else {
        this.popupService.openAlertDialog("Rate Type already exists.", "Billing Rates", "check_circle", false);
        this.isBillRateObjectChangesExists = false;
      }
    }
    else {
      this.popupService.openAlertDialog("Rate Type and Rate are required.", "Billing Rates", "check_circle", false);
    }
    this.customerRateDetailDataSource.data = this.customerRateDetailsList;
    this.customerRateDetailDataSource.sort = this.sortRateDetail;
    this.customerRatesForSelectedApplication(this.customerRateDetailsList);
    this.billingRateDataSource.data = this.billingRateList;
    this.billingRateDataSource.sort = this.sortBillingRates;
  }

  // To check Duplicate Rate Type.
  checkDuplicateCustomerRate(resetOrSaveRate: boolean): boolean {
    let custRateFlag = true;
    for (let cr of this.customerRateDetailsList) {
      if (!this.isRateUpdate) {
        if (resetOrSaveRate && cr.description === this.billingRateForm.get('billingDescription').value.description) {
          custRateFlag = false;
          break
        }
      } else {
        if (resetOrSaveRate && cr.description === this.billingRateForm.get('billingDescription').value.description && cr.customerRateID !== this.currentRateDetailID) {
          custRateFlag = false;
          break
        }
        else {
          if (resetOrSaveRate && cr.description === this.billingRateForm.get('billingDescription').value.description
            && cr.rate == +(String(this.billingRateForm.get('billingRate').value).replace(/,/g, ''))) {
            this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Billing Rates", "check_circle", false);
            break;
          }
          else if (!resetOrSaveRate && cr.description === this.billingRateForm.get('billingDescription').value.description
            && cr.rate == +(String(this.billingRateForm.get('billingRate').value).replace(/,/g, ''))) {
            custRateFlag = false;
          }
        }
      }
    }
    return custRateFlag;
  }

  //To set for customer rates for selected application.
  customerRatesForSelectedApplication(list: any) {
    this.billingRateList.forEach(item => {
      list.forEach(crd => {
        if (item.applicationID == crd.customerID) {
          item.customerRateDetails = list;
        }
      });
    });
  }

  //To populate data for edit Billing Rate Details.
  populateCustomerRateData(row: any) {
    this.highlightedRowsInBillingRate.pop();
    this.highlightedRowsInBillingRate.push(row);
    this.isRateUpdate = true;
    this.currentRateDetailID = row.customerRateID;
    this.billingRateForm.controls['billingRate'].setValue(row.rate == 0 ? this.dp.transform(0, '1.2-2') : this.dp.transform(row.rate, '1.4-4'));
    this.rateTypes.forEach(item => {
      if (item.rateTypeID == row.rateTypeID) {
        this.billingRateForm.controls['billingDescription'].setValue(item);
      }
    });
  }

  //To load selected row data into text fields.
  async selectCustomerRateRow(row) {
    if ((this.isChangeRateType()) && row.customerRateID != this.currentRateDetailID) {
      let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (resetResponse === "ok") {
        this.populateCustomerRateData(row);
        this.isRateTypeChangesExists = false;
      }
    } else {
      this.populateCustomerRateData(row);
    }
  }

  //To reset Customer Rate Details.
  async resetCustomerRateDetails() {
    if (this.checkDuplicateCustomerRate(false) && this.isChangeRateType()) {
      let response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (response === "ok") {
        this.ResetChangesInCustomerRate();
      }
    } else {
      this.ResetChangesInCustomerRate();
    }
  }

  //To clear Customer Rate Details.
  ResetChangesInCustomerRate() {
    this.isRateUpdate = false;
    this.isRateTypeChangesExists = false;
    this.highlightedRowsInBillingRate.pop();
    this.billingRateForm.controls['billingDescription'].setValue('');
    this.billingRateForm.controls['billingRate'].setValue('');
    this.billingRateForm.controls['billingRate'].setValue(this.dp.transform(0, '1.2-2'));
    this.currentRateDetailID = null;
  }

  //To populate Billing Rate Row.
  populateBillRateData(row: any) {
    this.resetBillingRateInfo();
    this.enableRatesWhenBillRate = false;
    this.isSpace = false;  
    this.currentApplicationID = row.applicationID;
    this.currentBillingRateAppID = row.appID;
    this.highlightedRowsInAssignedApplications.pop();
    this.highlightedRowsInAssignedApplications.push(row);
    this.billingRateForm.controls['appName'].setValue(row.applicationName);
    this.billingRateForm.controls['appCode'].setValue(row.applicationCode);
    this.billingRateForm.controls['statementName'].setValue(row.statementName);
    this.billingRateForm.controls['consolidationAccount'].setValue(row.consolidationAcc);
    this.billingRateForm.controls['billingActive'].setValue(row.isActive);
    this.billingRateForm.controls['printOrder'].setValue(row.printOrder);

    if (row.customerRateDetails) {
      row.customerRateDetails.forEach(item => {
        if (item.rateTypeID > 0) {
          this.customerRateDetailsList.push(item);
        }
      });
      this.customerRateDetailDataSource = new MatTableDataSource<CustomerRate>();
      this.customerRateDetailDataSource.data = this.customerRateDetailsList;
      this.customerRateDetailDataSource.sort = this.sortRateDetail;
      //To sort based on table header.
      this.customerRateDetailDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
        if (typeof data[sortHeaderId] === 'string') {
          return data[sortHeaderId].toLocaleLowerCase();
        }   
        return data[sortHeaderId];
      };

    }
    this.billingRateForm.controls['statementName'].enable();
    this.billingRateForm.controls['printOrder'].enable();
    this.billingRateForm.controls['consolidationAccount'].enable();
    this.billingRateForm.controls['billingActive'].enable();
    this.billingRateForm.controls['billingRate'].enable();
    this.billingRateForm.controls['billingDescription'].enable();
    this.billingRateForm.controls['billingRate'].setValue(this.dp.transform(0, '1.2-2'));

    this.billingRateForm.controls['statementName'].markAsUntouched();
    this.billingRateForm.controls['printOrder'].markAsUntouched();

    if (row.statementName == null || row.printOrder == null) {
      this.billingRateForm.controls['printOrder'].setErrors(null);
      this.billingRateForm.controls['printOrder'].clearValidators();
      this.billingRateForm.controls['statementName'].setErrors(null);
      this.billingRateForm.controls['statementName'].clearValidators();
    }
    
    this.EnableOrDisableFormControls(this.isAllowSave);
  }

  //To load selected row into text fields.
  async selectBillingRateRow(row) {
    if ((this.isBillRateChangesExists) && row.applicationID != this.currentApplicationID) {
      let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (resetResponse === "ok") {
        this.populateBillRateData(row);
        this.isBillRateChangesExists = false;
      }
    }
    else {
      this.populateBillRateData(row);
    }
  }

  //To update Billing Rate.
  submitBillingRate() {
    if (this.billingRateForm.get('statementName').value != null && this.billingRateForm.get('printOrder').value != null &&
      this.billingRateForm.get('statementName').value.trim() != "" && this.billingRateForm.get('printOrder').value != "") {
      for (var i = 0; i < this.billingRateList.length; i++) {
        if (this.currentApplicationID != 0 && this.billingRateList[i].applicationID == this.currentApplicationID) {
          this.billingRateList[i].applicationID = this.currentApplicationID;
          this.billingRateList[i].clientID = this.clientID;
          this.billingRateList[i].statementName = this.billingRateForm.get('statementName').value;
          this.billingRateList[i].consolidationAcc = this.billingRateForm.get('consolidationAccount').value? this.billingRateForm.get('consolidationAccount').value.trim():this.billingRateForm.get('consolidationAccount').value;
          this.billingRateList[i].printOrder = this.billingRateForm.get('printOrder').value;
          this.billingRateList[i].isActive = this.billingRateForm.get('billingActive').value;
          break;
        }
      }
    }
    else {
      this.popupService.openAlertDialog("Statement Name and Print Order are required.", "Billing Rates", "check_circle", false);
    }
    this.isBillRateChangesExists = false;
    this.billingRateDataSource.data = this.billingRateList;
    this.billingRateDataSource.sort = this.sortBillingRates;
  }

  //To clear billing rate Form.
  resetBillingRateInfo() {
    this.highlightedRowsInAssignedApplications.pop();
    this.billingRateForm.markAsUntouched();
    this.billingRateForm.controls['appName'].setValue('');
    this.billingRateForm.controls['appCode'].setValue('');
    this.billingRateForm.controls['statementName'].setValue('');
    this.billingRateForm.controls['printOrder'].setValue('');
    this.billingRateForm.controls['consolidationAccount'].setValue('');
    this.billingRateForm.controls['billingActive'].setValue(false);
    this.isRateTypeChangesExists = false;
    this.isBillRateObjectChangesExists = false;
    this.enableRatesWhenBillRate = true;
    this.currentApplicationID = null;
    this.isBillRateChangesExists = false;
    this.customerRateDetailDataSource.data = [];
    this.customerRateDetailsList = [];
    this.selectedBRDetailsList = [];
    this.billingRateForm.controls['printOrder'].setErrors(null);
    this.billingRateForm.controls['printOrder'].clearValidators();
    this.billingRateForm.controls['statementName'].setErrors(null);
    this.billingRateForm.controls['statementName'].clearValidators();

    this.billingRateForm.controls['statementName'].disable();
    this.billingRateForm.controls['printOrder'].disable();
    this.billingRateForm.controls['consolidationAccount'].disable();
    this.billingRateForm.controls['billingActive'].disable();
    this.ResetChangesInCustomerRate();

  }

  //To delete customer Rate.
  
  async deleteBillingRateDetail(id: number) {
    if(this.isChangeRateType()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
       // this.resetCustomerRateDetails();
        this.ResetChangesInCustomerRate();
				this.deleteSelectedBillingRateDetail(id);				
			}
		}
		else{
			this.deleteSelectedBillingRateDetail(id);	
    }    
  }

  brdIndex: Number;
  async deleteSelectedBillingRateDetail(id:number){
    const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
    if (userresponse === "ok") {
      this.brdIndex = this.customerRateDetailsList.findIndex(function (item: any) {
        return item.customerRateID === id;
      });
      let appIndex = this.billingRateList.findIndex(x => x.applicationID == this.currentApplicationID)
      this.customerRateDetailsList.splice(this.brdIndex, 1);
      this.customerRateDetailDataSource.data = this.customerRateDetailsList;
      this.customerRateDetailDataSource.sort = this.sortRateDetail;
      if (this.customerRateDetailsList.length == 0) {
        this.billingRateList[appIndex].customerRateDetails = [];
        this.billingRateList[appIndex].customerRateDetails.push(
          {
            'customerRateID': -1,
            'customerID': this.currentApplicationID,
            'appID': -1,
            'rateTypeID': -1,
            'rate': +213,
            'description': ''
          });
      } else {
        this.billingRateList[appIndex].customerRateDetails = this.customerRateDetailsList;
      }
      if(!this.isChangeRateType()){
        this.resetCustomerRateDetails();
      }    
    }
  }

  //To validate Amount fields.
  validateDecimals(key) {
    var keycode = (key.which) ? key.which : key.keyCode;
    let inputData: string = key.srcElement.value;
    let inputData1 = +inputData
    if (inputData != "" && inputData != null && inputData1 > 0) {
      if (inputData.replace(/,/g, '').length < 10) {
        if (inputData.replace(/,/g, '').length == 6 && inputData.indexOf('.') == -1) {
          if (keycode == 46) { return true; }
          else { return false; }
        }
        else {
          if ((keycode == 46 && inputData.indexOf('.') == -1)) { return true; }
          else if (keycode < 48 || keycode > 57) { return false; }
        }
      }
      else { return false; }
    }
    else {
      if (inputData == '' || inputData1 == 0) {
        if (key.which == 48) {
          return false;
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
    }
  }

  //To change amount data to required pattern.
  changeToAmount(controlName: string) {
    let ctrlVal = (String(this.billingRateForm.controls[controlName].value).replace(/,/g, ''));
    if (this.billingRateForm.controls[controlName].value != null && this.billingRateForm.controls[controlName].value != "" && ctrlVal.length > 0) {
      if(ctrlVal.length< 13 || this.dp.transform(+ctrlVal, '1.4-4').length < 13){
        let amount = +ctrlVal;
        this.billingRateForm.controls[controlName].setValue(amount == 0 ? this.dp.transform(amount, '1.2-2') : this.dp.transform(amount, '1.4-4'));
      }
    }
    else {
      this.billingRateForm.controls[controlName].setValue("");
      this.billingRateForm.controls[controlName].setValue(this.dp.transform(+ctrlVal, '1.2-2'));
      this.billingRateForm.controls['billingRate'].setErrors({'incorrect':true});
    }
  }

  //To check mat-errors.
  public hasError = (controlName: string, errorName: string) => {
    return this.billingRateForm.controls[controlName].hasError(errorName);
  }

  //on submit data.
  async onFormSubmit() {
    const billingRateData = this.billingRateForm.value;
    let billingRateFinalObject = this.buildFinalFormObject(billingRateData);
    if (billingRateFinalObject.billingRates.length > 0) {
      let flag = await this.dirtyFlagValidation(this.tempBillingRates, billingRateFinalObject.billingRates);
      if (!flag) {
        this.saveBillingRateInfo(billingRateFinalObject);
      }
      else {
        //this.resetBillingRateInfo();
        this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Billing Rates", "check_circle", false);
      }
    }
    else {
      this.resetBillingRateInfo();
      this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Billing Rates", "check_circle", false);
    }
  }

  //To build billing rate Final Object.
  buildFinalFormObject(billingRateData): any {
    billingRateData.clientID = this.clientID;
    for (let i = 0; i < this.billingRateList.length; i++) {
      if (this.billingRateList[i].statementName != this.tempBillingRates[i].statementName ||
        this.billingRateList[i].printOrder != this.tempBillingRates[i].printOrder ||
        this.billingRateList[i].consolidationAcc != this.tempBillingRates[i].consolidationAcc ||
        this.billingRateList[i].isActive != this.tempBillingRates[i].isActive) {
        let billingRateIndex = this.selectedBRDetailsList.findIndex(x => x.applicationID == this.billingRateList[i].applicationID);
        if (billingRateIndex == -1) {
          this.selectedBRDetailsList.push(this.billingRateList[i]);
        }
        else {
          this.selectedBRDetailsList.splice(billingRateIndex, 1);
          this.selectedBRDetailsList.push(this.billingRateList[i]);
        }
      }
      else {
        if ((this.billingRateList[i].customerRateDetails.length > 0 || this.tempBillingRates[i].customerRateDetails.length > 0) && JSON.stringify(this.billingRateList[i].customerRateDetails) != JSON.stringify(this.tempBillingRates[i].customerRateDetails)) {
          let billingRateIndex = this.selectedBRDetailsList.findIndex(x => x.applicationID == this.billingRateList[i].applicationID);
          if (billingRateIndex == -1) {
            this.selectedBRDetailsList.push(this.billingRateList[i]);
          }
          else {
            this.selectedBRDetailsList.splice(billingRateIndex, 1);
            this.selectedBRDetailsList.push(this.billingRateList[i]);
          }
        }
      }
    }
    billingRateData.billingRates = this.selectedBRDetailsList;
    // object building
    this.billingRateFinalObject = {
      clientID: billingRateData.clientID,
      billingRates: billingRateData.billingRates
    };
    return this.billingRateFinalObject;
  }


  //Validation for dirty Flag .
  async dirtyFlagValidation(unChangedServiceObj, formObj) {
    let keyFlag = true;
    for (let i = 0; i < formObj.length; i++) {
      let appID = formObj[i].applicationID;
      let index = unChangedServiceObj.findIndex(x => x.applicationID == appID)
      if (index != -1) {
        if (formObj[i].statementName != unChangedServiceObj[index].statementName || formObj[i].printOrder != unChangedServiceObj[index].printOrder ||
          formObj[i].consolidationAcc != unChangedServiceObj[index].consolidationAcc || formObj[i].isActive != unChangedServiceObj[index].isActive) {
          keyFlag = false;
          break;
        }
        else {
          if ((formObj[i].customerRateDetails.length > 0 || unChangedServiceObj[index].customerRateDetails.length > 0)) {
            for (let j = 0; j < formObj[i].customerRateDetails.length; j++) {
              if (formObj[i].customerRateDetails.length == unChangedServiceObj[index].customerRateDetails.length) {
                await formObj[i].customerRateDetails.sort((a, b) => (a.rate > b.rate) ? 1 : ((b.rate > a.rate) ? -1 : 0));
                await unChangedServiceObj[index].customerRateDetails.sort((a, b) => (a.rate > b.rate) ? 1 : ((b.rate > a.rate) ? -1 : 0));
                if (formObj[i].customerRateDetails[j].rateTypeID != unChangedServiceObj[index].customerRateDetails[j].rateTypeID
                  || formObj[i].customerRateDetails[j].rate != unChangedServiceObj[index].customerRateDetails[j].rate) {
                  keyFlag = false;
                  break;
                }
              }
              else {
                keyFlag = false;
                break;
              }
            }
          }
        }
      }
    }
    return keyFlag;
  }

  //To save billing rate.
  saveBillingRateInfo(billingRateFinalObject) {
    this.billingrateService.createBillingRate(billingRateFinalObject).subscribe(res => {
      this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Billing Rates", "check_circle", false);
      this.resetBillingRateInfo();
      this.loadAllBillingRates(this.clientID);
    },
      (error) => {
        this.errorService.handleError(error);
      });
  }


  //To reset billing rate Form.
  async resetServiceAgreement() {
    let obj = this.buildFinalFormObject(this.billingRateForm.value);
    let checkFlag = await this.dirtyFlagValidation(this.tempBillingRates, obj.billingRates);
    if (!checkFlag || (this.checkDuplicateCustomerRate(false)&& this.isChangeRateType())) {
      const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (response === "ok") {
        this.resetBillingRateInfo();
        this.loadAllBillingRates(this.clientID);
      }
    }
    else {
      let currentRowValid = this.checkTouchedCurrentRows();
      if (!currentRowValid) {
        const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
        if (response === "ok") {
          this.resetBillingRateInfo();
          this.loadAllBillingRates(this.clientID);
        }
      }
      else {
        this.resetBillingRateInfo();
        this.loadAllBillingRates(this.clientID);
      }
    }
  }

  //To check dirty flag for selected biiling rate row fields.
  checkTouchedCurrentRows() {
    let validState = true;
    if (this.highlightedRowsInAssignedApplications.length > 0 || this.highlightedRowsInBillingRate.length > 0) {
      if (this.highlightedRowsInAssignedApplications.length > 0) {
        let statementName = this.billingRateForm.controls['statementName'].value;
        let consolidationAccount = this.billingRateForm.controls['consolidationAccount'].value;
        let printOrder = this.billingRateForm.controls['printOrder'].value;
        let billingActive = this.billingRateForm.controls['billingActive'].value;
        if (statementName != this.highlightedRowsInAssignedApplications[0].statementName || consolidationAccount != this.highlightedRowsInAssignedApplications[0].consolidationAcc
          || printOrder != this.highlightedRowsInAssignedApplications[0].printOrder || billingActive != this.highlightedRowsInAssignedApplications[0].isActive) {
          validState = false;
        }
      }
      if (this.highlightedRowsInBillingRate.length > 0) {
        let billingDescription = this.billingRateForm.controls['billingDescription'].value;
        let billingRate = this.billingRateForm.controls['billingRate'].value;
        if (billingDescription.rateTypeID != this.highlightedRowsInBillingRate[0].rateTypeID ||
          billingRate != this.highlightedRowsInBillingRate[0].rate) {
          validState = false;
        }
      }
    }
    return validState;
  }

  //To close billing rate dialog.
  async dialogCancel() {
   // if (!this.fromHome) {
      let obj = this.buildFinalFormObject(this.billingRateForm.value);
      let checkFlag = await this.dirtyFlagValidation(this.tempBillingRates, obj.billingRates);
      if (!checkFlag || (this.checkDuplicateCustomerRate(false)&& this.isChangeRateType())) {
        const response = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
        if (response === "ok") {
          this.dialogRef.close("cancel");
        }
      } 
      else {
        let currentRowValid = this.checkTouchedCurrentRows();
        if (!currentRowValid) {
          const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
          if (response === "ok") {
            this.dialogRef.close("cancel");
          }
        }
        else {
          this.dialogRef.close("cancel");
        }
      }
   /*  } 
    else {
      this.dialogRef.close("cancel");
    } */
  }


}// billing rate component ends here..
