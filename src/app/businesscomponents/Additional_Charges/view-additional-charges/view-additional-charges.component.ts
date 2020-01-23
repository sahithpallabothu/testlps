import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, ElementRef, QueryList } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource, MatPaginator, MatRadioButton, MatRadioGroup, ErrorStateMatcher } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AdditionalchargesService } from '@/businessservices/additionalcharges/additionalcharges.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { Router } from '@angular/router';
import { CustomerService } from '@/businessservices/customer/customer.service';
import { Customer } from '@/businessclasses/Customer/customer';
import { Application } from '../../../businessclasses/application/application';
import { ApplicationService } from '../../../businessservices/application/application.service';
import { MessageConstants } from '@/shared/message-constants';
import { GetAdditionalCharges, AdditionalChargesInfo } from '@/businessclasses/additionalcharges/additionalcharges';
import { UserPrivilegesService } from '@/_services/userprivilege.service';
import { Constants } from '@/app.constants';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { PostageService } from '../../../businessservices/postage/postage.service';
import { ChargesDialogComponent } from '@/businesscomponents/Postage/charges-dialog/charges-dialog.component';
import { CustomDateConvertor } from '@/shared/customDateConvertor';
@Component({
  selector: 'app-view-additional-charges',
  templateUrl: './view-additional-charges.component.html',
  styleUrls: ['./view-additional-charges.component.css']
})
export class ViewAdditionalChargesComponent implements OnInit {
  spinnerText = MessageConstants.SPINNERTEXT;
  hideSpinner = false;
  checked = false;

  AddlChargeList = [];
  customerDetails: Customer[] = [];
  applicationDetails: Application[] = [];
  customerList: Observable<Customer[]>;
  applicationList: Observable<Application[]>;
  filteredOptionsCustomer: Observable<Customer[]>;
  filteredOptionsCustomerCode: Observable<Application[]>;
  customerArray = [];
  applicationArray = [];
  ifFilterBySelected = true;
  searchText: string;
  isvalid = false;
  id: 1;
  tempArray = [];
  isTableHasData = true;
  isChargesEdited: boolean = false;
  datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];

  hasScreenAdditionalChargeUpdatePriviledge = false;
  dataSourceViewAddlCharge = new MatTableDataSource<GetAdditionalCharges>();
  allAddlCharges: Observable<GetAdditionalCharges[]>;
  @ViewChild('sortCharges') sort: MatSort;
  @ViewChildren('formRow') rows: QueryList<any>

  @ViewChild('customerNameAuto') customerNameAuto: ElementRef;
  @ViewChildren('customerCodeAuto') customerCodeAuto: ElementRef;
  @ViewChildren('customerNameAuto') focusedElement: QueryList<any>;
  @ViewChildren('customerCodeAuto') focusedCodeElement: QueryList<any>;

  highlightedRows = [];
  viewAddlChargeForm: FormGroup;
  addlChargeColumns: string[] = ['customerCode',
    'jobName',
    'runDate',
    'feeDesc',
    'amount',
    'comments',
    'dateEntered',
    'enteredUser'];

  constructor(private formbulider: FormBuilder,
    private applicationservice: ApplicationService,
    private errorService: ErrorHandlerService,
    private popupService: PopupMessageService,
    private customerservice: CustomerService,
    private router: Router,
    private postageService: PostageService,
    private dialog: MatDialog,
    private addlChargeService: AdditionalchargesService,
    private userPrivilegesService: UserPrivilegesService, ) {
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.additionalChargesScreenName)) {
      this.hasScreenAdditionalChargeUpdatePriviledge = true;
    }
  }

  ngOnInit() {
    this.viewAddlChargeForm = this.formbulider.group({
      CustomerName: [, []], //Validators.required
      CustomerCode: [, []],
    });

    this.loadCustomerList();
    this.loadApplicationList();

    this.dataSourceViewAddlCharge.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'dateEntered': return new Date(item.dateEntered);
        case 'runDate': return new Date(item.runDate);
        case 'amount': return +item[property];
        default: return item[property].toLocaleLowerCase();
      }
    };
   
  }

  public ngAfterContentInit() {
    this.setFocus();
  }

  //to initialize customer name 
  initializeAutocompleteCustomer() {
    this.filteredOptionsCustomer = this.viewAddlChargeForm.controls['CustomerName'].valueChanges
      .pipe(
        startWith<string | Customer>(''),
        map(value => typeof value === 'string' ? value : value.customerName),
        map(customername => customername ? this._filter(customername) : this.customerDetails.slice())
      );
  }

  //initialize auto complete customer code
  initializeAutoCompleteCustomerCode() {
    this.filteredOptionsCustomerCode = this.viewAddlChargeForm.controls['CustomerCode'].valueChanges
      .pipe(
        startWith<string | Application>(''),
        map(value => typeof value === 'string' ? value : value.applicationCode),
        map(ccode => ccode ? this._filterCustCode(ccode) : this.applicationDetails.slice()),
        map(ccode => ccode.sort((a, b) => (a.applicationCode > b.applicationCode) ? 1 : ((b.applicationCode > a.applicationCode) ? -1 : 0)))
      );
  }

 // For customer name.
  displayFn(user?: Customer): string | undefined {
    return user ? user.customerName : undefined;
  }
 // For application code.
  displayFnCustCode(user?: Application): string | undefined {
    return user ? user.applicationCode : undefined;
  }

  // for customer name
  private _filter(name: string): Customer[] {
    const filterValue = name.toLowerCase();
    return this.customerDetails.filter(option => option.customerName.toLowerCase().indexOf(filterValue) === 0);
  }

  // For application code.
  private _filterCustCode(name: string): Application[] {
    const filterValue = name.toLowerCase();
    return this.applicationDetails.filter(option => option.applicationCode.toLowerCase().indexOf(filterValue) === 0);
  }


  ViewAdditionalChargesCustomerCode(eventObj) {
    if (eventObj.srcElement.value === "" && this.applicationArray.length === this.applicationDetails.length) {
      this.viewAddlChargeForm.controls["CustomerCode"].setValue("");
      this.viewAddlChargeForm.controls["CustomerName"].setValue("");
     this.viewAddlChargeForm.controls["CustomerCode"].setErrors(null);
     this.viewAddlChargeForm.controls["CustomerName"].setErrors(null);
      this.applicationDetails = this.applicationArray;
      //this.initializeAutoCompleteCustomerCode();
    }
    else {
      this.isChangeInApplication(eventObj, false);
    }
  }


  isChangeInApplication(applicationObject: any, isAC) {
    let typeOfCode = typeof this.viewAddlChargeForm.controls['CustomerCode'].value;
    let cCode ;
    if(typeOfCode == 'string'){
      cCode = this.viewAddlChargeForm.controls['CustomerCode'].value
    }else{
      cCode = this.viewAddlChargeForm.controls['CustomerCode'].value.applicationCode;
    }
    let foundFlag = false;
    if (cCode != null) {
      let client = this.applicationDetails.find(x => x.applicationCode.toLowerCase() == cCode.toLowerCase())
      for (let name of this.customerDetails) {
        if (client && name.customerId === client.clientID) {
          this.viewAddlChargeForm.controls['CustomerName'].setValue({ customerName: name.customerName });
          foundFlag = true;
        }
      }
    }

    if(!foundFlag && applicationObject.srcElement.value!==""){
      this.viewAddlChargeForm.controls['CustomerCode'].setErrors({'incorrect': true});
    }

  }

  //  On Customer  Dropdown change
  isChangeInCustomer(customerObject, isAC) {
    this.viewAddlChargeForm.controls['CustomerCode'].setValue('');
    this.applicationDetails = [];
    let cName;
    let res = false;
   cName= this.customerNameAuto.nativeElement.value;
      let selectedClient = this.customerArray.find(item=>item.customerName.toLowerCase()==cName.toLowerCase());
      if (cName != null) {
      for (let name of this.applicationArray) {
     
        if (selectedClient != null && name.clientID ===selectedClient.customerId) {
          this.applicationDetails.push(name);
          res=true;
        }
      }
      
      if( this.applicationDetails.length === 1){
        this.viewAddlChargeForm.controls['CustomerCode'].setValue({ applicationCode: this.applicationDetails[0].applicationCode });
      }else if( this.applicationDetails.length>=1){
        this.setFocusToCode();
      }
      if(selectedClient == null && cName != null && cName != ""){
        this.viewAddlChargeForm.controls['CustomerName'].setErrors({'incorrectCustomerName': true});
      }
      this.initializeAutoCompleteCustomerCode();
   
    }
  }



  //remove time stamp from datetime
  getDateOnly(pDate) {
    return CustomDateConvertor.dateConvertor(pDate);
  }


  //to set focus on particular elemrnt
  setFocus() {
    setTimeout(() => {
      this.focusedElement.last.nativeElement.focus();
    }, 500);
  }

  //to set focus on particular elemrnt
  setFocusToCode() {
    setTimeout(() => {
      this.focusedCodeElement.last.nativeElement.focus();
    }, 500);
  }
  



  validateCustomerNameAutoCompletes(eventObj) {
 
    if (eventObj.srcElement.value === "") {
      this.viewAddlChargeForm.controls["CustomerName"].setValue("");
      this.viewAddlChargeForm.controls["CustomerCode"].setValue("");
      this.applicationDetails = this.applicationArray;
      this.initializeAutoCompleteCustomerCode();
    }
    else {
      this.isChangeInCustomer(eventObj, false);
    }
  }



  //loadCustomerList
  loadCustomerList() {
    this.customerList = this.customerservice.getAllCustomers();
    this.customerList.subscribe(results => {
      this.customerDetails = results;
      this.customerDetails.sort((a, b) => (a.customerName > b.customerName) ? 1 : ((b.customerName > a.customerName) ? -1 : 0));
      this.customerArray = results;
      this.initializeAutocompleteCustomer();
    });
  }

  loadApplicationList() {
    this.applicationList = this.applicationservice.getAllApplications();
    this.applicationList.subscribe(results => {
      this.applicationDetails = results;
      this.applicationDetails.sort((a, b) => (a.applicationCode > b.applicationCode) ? 1 : ((b.applicationCode > a.applicationCode) ? -1 : 0));
      this.applicationArray = results;
      this.initializeAutoCompleteCustomerCode();
    });
  }

  loadAddlChargesList(custCode,clientName) {    
    this.hideSpinner = true;
    this.allAddlCharges = this.addlChargeService.getAllAddlCharges(custCode,clientName);
    this.allAddlCharges.subscribe(results => {
      if (!results) { return };
      this.AddlChargeList = results;
      //this.dataSourceViewAddlCharge = new MatTableDataSource<GetAdditionalCharges>()
      this.dataSourceViewAddlCharge.data = results;
      this.dataSourceViewAddlCharge.sort = this.sort;
      this.tempArray = results;     
      this.hideSpinner = false;

      if (this.dataSourceViewAddlCharge.data.length > 0) {
        this.isTableHasData = true;
      }
      else {
        this.isTableHasData = false;
      }
    },
      (error) => {
        this.hideSpinner = false;
        this.errorService.handleError(error);
      });
  }

  //validate results count to load data into grid.
  validateResultsCount(custCode,clientName){
    this.addlChargeService.getAllAddlChargesCount(custCode,clientName).subscribe(results => {
       if (!results) { return };
       if (results.message == MessageConstants.MAX_LIMIT_EXCEEED) 
       {
         this.popupService.openAlertDialog("The current criteria for this search may result in a timeout. Please enter some additional criteria and try again.", "Additional Charges", "check_circle");
       }
       else {
             this.loadAddlChargesList(custCode,clientName);
          }
       },
         (error) => {
           
           this.errorService.handleError(error);
         });
   }

  // Loads data in the grid based on the search criteria.
  currentCustomerCode = "-1";currentClientName="-1" ; 
  loadDataInGrid() {
    this.tempArray = [];
    let codeType = typeof this.viewAddlChargeForm.get('CustomerCode').value;
    let nameType = typeof this.viewAddlChargeForm.get('CustomerName').value;
    let custCode = "-1", clientName ="-1";
    if (codeType == "object" && this.viewAddlChargeForm.get('CustomerCode').value !== null) {
      custCode = this.viewAddlChargeForm.controls['CustomerCode'].value['applicationCode'];
    } else {
      custCode = this.viewAddlChargeForm.get('CustomerCode').value == null || this.viewAddlChargeForm.get('CustomerCode').value == "" ? "-1" : this.viewAddlChargeForm.get('CustomerCode').value;
    }
    if (nameType == "object" && this.viewAddlChargeForm.get('CustomerName').value !== null) {
      clientName = this.viewAddlChargeForm.controls['CustomerName'].value['customerName'];
    } else {
      clientName = this.viewAddlChargeForm.get('CustomerName').value == null || this.viewAddlChargeForm.get('CustomerName').value == "" ? "-1" : this.viewAddlChargeForm.get('CustomerName').value;
    }
    this.currentCustomerCode = custCode;
    this.currentClientName = clientName;
    //this.loadAddlChargesList(custCode,clientName);
    this.validateResultsCount(custCode,clientName);
  }

  selectRow(row) {
    this.highlightedRows.pop();
    this.highlightedRows.push(row);
  }


  //open additional charges dialog
  showAdditionalChargesDialog(rowValue) {

    let ACObject = {
      chargeId: rowValue.acRecordID,
      feeId: rowValue.feeID,
      chargeType: rowValue.feeDesc,
      chargeAmount: rowValue.amount,
      description: rowValue.comments,
      chargeDate: rowValue.dateEntered,
      userName: rowValue.enteredUser,
      jobNumber: rowValue.jobName,
      customerCode: rowValue.customerCode,
      customerName: rowValue.customerName,
      clientCode: rowValue.clientCode,
      clientName: rowValue.clientName
    };
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    if (rowValue != "") {
      dialogConfig.data =
        {
          title: "Edit Charge",
          tempData: ACObject,
          isChargesEdited: false,//this.isChargesEdited,
          callFromDblClick: true,
          isViewACScreen: true,
        };
    }

    const dialogRef = this.dialog.open(ChargesDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value.isChargesDataEdited) {
        this.loadAddlChargesList(this.currentCustomerCode,this.currentClientName);
      }
    });


  }


  resetForm() {
    this.viewAddlChargeForm.controls['CustomerName'].setValue("");
    this.viewAddlChargeForm.controls['CustomerCode'].setValue("");
    this.highlightedRows.pop();
    this.dataSourceViewAddlCharge.data = [];
    this.isTableHasData = false;
    this.viewAddlChargeForm.controls['CustomerName'].setErrors(null);
    this.viewAddlChargeForm.controls['CustomerCode'].setErrors(null);
    this.applicationDetails = this.applicationArray;
    this.initializeAutoCompleteCustomerCode();
    this.initializeAutocompleteCustomer();
    this.setFocus();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.viewAddlChargeForm.controls[controlName].hasError(errorName);
  }



}
