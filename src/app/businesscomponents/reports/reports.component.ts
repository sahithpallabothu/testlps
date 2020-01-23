import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource, MatSort,MatButton,MatSelect } from '@angular/material';
import { Flagtype } from '../../businessclasses/admin/flagtype';
import { FlagtypeService } from '../../businessservices/admin/flagtype.service';
import { Observable } from 'rxjs';
import { MessageConstants } from '@/shared/message-constants';
import { Constants } from '../../app.constants'
import { aristalogo } from '@/shared/aristalogo';
import { ReportsService } from '../../businessservices/reports/reports.service';
import { Reports } from '../../businessclasses/reports/reports'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
//import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { ExportToCsv } from 'export-to-csv';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('selectFocus') selectFocus: MatSelect;
  reportsForm: FormGroup;
  holdOptionColumns = [{ 'width': '30', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':60 },
  { 'width': '13', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':50 },
  { 'width': '10', 'columnName': 'Processing Hold', 'tableName': 'processingHold', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':50 },
  { 'width': '33', 'columnName': 'Held Reason', 'tableName': 'heldReason', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':60 },
  { 'width': '14', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '' ,'cellWidth':47}]
  customerTypeOptionColumns = [{ 'width': '30', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':85 },
  { 'width': '30', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':50 },
  { 'width': '20', 'columnName': 'Customer Flag', 'tableName': 'customerFlag', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':75 },
  { 'width': '20', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':57 }];
  printOptionColumns = [{ 'width': '15', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '10', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '' ,'cellWidth':20},
  { 'width': '5', 'columnName': 'Customer State', 'tableName': 'customerState', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '5', 'columnName': 'Flag Description', 'tableName': 'customerFlag', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '5', 'columnName': 'AppType Description', 'tableName': 'appType', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow1' ,'cellWidth':20},
  { 'width': '10', 'columnName': 'Print WinSalem', 'tableName': 'printLocation', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':20 },
  { 'width': '6', 'columnName': 'Form Code', 'tableName': 'formCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow' ,'cellWidth':20},
  { 'width': '7', 'columnName': 'Window EnvCode', 'tableName': 'windowEnvCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '7', 'columnName': 'Return EnvCode', 'tableName': 'returnEnvCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '5', 'columnName': 'PDF', 'tableName': 'pdf', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '' ,'cellWidth':10},
  { 'width': '10', 'columnName': 'Run Frequency', 'tableName': 'runFrequency', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '' ,'cellWidth':20},
  { 'width': '5', 'columnName': 'STID', 'tableName': 'stid', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':20 },
  { 'width': '5', 'columnName': 'Perf Description', 'tableName': 'perfPatternDescription', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '5', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':14 }]
  billTypeOptionColumns = [{ 'width': '11', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':20 },
  { 'width': '7', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':18 },
  { 'width': '7', 'columnName': 'Ancillary Bill', 'tableName': 'ancillaryBill', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':15 },
  { 'width': '6', 'columnName': 'Detail Bill', 'tableName': 'detailBill', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':15 },
  { 'width': '6', 'columnName': 'Invoice Bill', 'tableName': 'invoiceBill', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':15 },
  { 'width': '5', 'columnName': 'Itemized', 'tableName': 'itemized', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':15 },
  { 'width': '4', 'columnName': 'MDM', 'tableName': 'mdm', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':13 },
  { 'width': '6', 'columnName': 'MultiMeter Bill', 'tableName': 'multimeterBill', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':17 },
  { 'width': '5', 'columnName': 'Multi Up', 'tableName': 'multiUp', 'fxLayoutAlign': 'center center', 'textAlign': 'left', 'class': '','cellWidth':15 },
  { 'width': '6', 'columnName': 'Municipal Bill', 'tableName': 'municipalBill', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':17 },
  { 'width': '6', 'columnName': 'Summary Bill', 'tableName': 'summaryBill', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '' ,'cellWidth':16},
  { 'width': '5', 'columnName': 'TDHUD', 'tableName': 'tdhud', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':14 },
  { 'width': '5', 'columnName': 'TVA', 'tableName': 'tva', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':10 },
  { 'width': '6', 'columnName': 'Unbundled', 'tableName': 'unBundled', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '' ,'cellWidth':18},
  { 'width': '4', 'columnName': 'Check', 'tableName': 'check', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':12 },
  { 'width': '6', 'columnName': 'Delinquent', 'tableName': 'delinquent', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':18 },
  { 'width': '5', 'columnName': 'Third Party', 'tableName': 'thirdParty', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':15 }]

  pdfOptionColumns = [{ 'width': '35', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':60 },
  { 'width': '25', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '' ,'cellWidth':50},
  { 'width': '20', 'columnName': 'Customer App Type', 'tableName': 'appType', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':60 },
  { 'width': '10', 'columnName': 'PDF', 'tableName': 'pdf', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':50 },
  { 'width': '10', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':47 },
  ]
  emailAddressOptionColumns = [{ 'width': '35', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':60 },
  { 'width': '20', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':50 },
  { 'width': '25', 'columnName': 'Email Address', 'tableName': 'emailAddress', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':60 },
  { 'width': '15', 'columnName': 'Flag Description', 'tableName': 'customerFlag', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':50 },
  { 'width': '5', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '' ,'cellWidth':47},]
  ebppOptionColumns = [{ 'width': '35', 'columnName': 'Customer Name', 'tableName': 'applicationName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow' ,'cellWidth':60},
  { 'width': '25', 'columnName': 'Customer Code', 'tableName': 'applicationCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '' ,'cellWidth':50},
  { 'width': '20', 'columnName': 'AppType Description', 'tableName': 'appType', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':60 },
  { 'width': '10', 'columnName': 'EBPP', 'tableName': 'abpp', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':50 },
  { 'width': '10', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '','cellWidth':47 },]
  clientSalesOptionColumns = [{ 'width': '35', 'columnName': 'Client Name', 'tableName': 'customerName', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow','cellWidth':60 },
  { 'width': '15', 'columnName': 'Client Code', 'tableName': 'customerCode', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':50 },
  { 'width': '30', 'columnName': 'Software', 'tableName': 'software', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': 'columnOverFlow1','cellWidth':60 },
  { 'width': '15', 'columnName': 'Mailing State', 'tableName': 'mailingState', 'fxLayoutAlign': 'start center', 'textAlign': 'left', 'class': '','cellWidth':50 },
  { 'width': '5', 'columnName': 'Active', 'tableName': 'active', 'fxLayoutAlign': 'center center', 'textAlign': 'center', 'class': '' ,'cellWidth':47},]

  //column Formats
  columnFormats = {};

  searchByOptions: string[] = ['Hold', 'Customer Type', 'Print/Mail', 'Email Address', 'PDF', 'EBPP', 'Bill Type', 'Customer Information'];
  searchActiveDef: string[] = ['All', 'Active', 'Inactive'];
  searchActiveOnly: string[] = ['Active'];
  searchActive: string[] = ['Active', 'Inactive'];
  searchByValue = [];
  searchStatus = [];
  //Defaut values for search by value.
  default: string = 'All';
  searchValue = ['Yes', 'No'];
  allFlagtypes: Observable<Flagtype[]>;
  flagArray: Flagtype[];
  highlightedRows = [];
  spinnerText = MessageConstants.SPINNERTEXT;
  hideSpinner = false;
  isTableHasData = true;
  fromReset:boolean=false;
  dataSourceReports = new MatTableDataSource<Reports>();
  initialSortColumn = "applicationName";
  obj_RunFrequency = {
    0: "No Set Frequency",
    2: "Weekly",
    3: "Monthly",
    4: "Bi-Weekly",
    7: "Bi-Monthly",
    8: "Quarterly",
    9: "Annually",
    1: "Daily",
    5: "",
    6: ""
  }

  tableColumns = this.holdOptionColumns;
  tableColumnNames = [];
  resultColumnNames = [];
  csvColumnNames=[];
  tableRowData = [];
  tableResultsFinalData = [];
  manualRowSelection: boolean = false;
  manualRowSelectionPrint: boolean = false;
  printButtonEnabled: boolean = false;

  //check changes exist or not and call the savechanges() method
  selectedTableData: any;
  filename = "Reports.pdf";
  type = "text/plain";
  currentDate: string;

  constructor(private formbulider: FormBuilder,
    private flagtypeservice: FlagtypeService,
    private reportsService: ReportsService) { }

  ngOnInit() {

    this.reportsForm = this.formbulider.group({
      searchBy: [, []],
      searchValue: [, []],
      searchStatus: [, []],
    });

    //loading all flags
    this.loadAllFlagtypes();
 
    this.dataSourceReports.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase();
      }
      return data[sortHeaderId];
    };

    this.setFocus();
    
  }

  setFocus(){
    //Focus first element
    setTimeout(() => {
			this.selectFocus.focus();
		}, 0);  
  }

  // highlights the selected row.
  selectRow(row) {
    this.highlightedRows.pop();
    this.highlightedRows.push(row);
  }

  //For settings options in local storage.
  loadSearchCriteria() {
    let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
    let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.reportsScreenName) : -1;
    if (index == -1) {
      this.reportsForm.controls['searchBy'].setValue('Hold');
      this.isChangeSearchBy('Hold');
    }
    else {
      this.reportsForm.controls['searchBy'].setValue(searchCriteriaObj[index].searchBy);
      this.isChangeSearchBy(searchCriteriaObj[index].searchBy);
      this.reportsForm.controls['searchValue'].setValue(searchCriteriaObj[index].searchOption);
      this.reportsForm.controls['searchStatus'].setValue(searchCriteriaObj[index].searchStatus);
    }
  }

  //dynamically appends the columns names for mat table.
  setColumnNames(data) {
    this.tableColumnNames = [];
    this.resultColumnNames = [];
    this.csvColumnNames=[];
    this.columnFormats = {};
    for (let dataColumns of data) {
      this.tableColumnNames.push(dataColumns['columnName']);
      this.csvColumnNames.push(dataColumns['columnName']);
      this.resultColumnNames.push(dataColumns['tableName']);
      //this.columnFormats.push({[dataColumns['tableName'].toLowerCase()]:{halign:dataColumns['textAlign']}})
      this.columnFormats[dataColumns['tableName'].toLowerCase()] = { halign: dataColumns['textAlign'], fontSize: 7 ,overflow:'linebreak',cellWidth:dataColumns['cellWidth']};
    }
  }

  // Populates the data into seacrh value and active / inactive drop downs based on the option selected in search by.
  isChangeSearchBy(value) {
    this.searchByValue = [];
    this.searchStatus = [];
    this.manualRowSelection = false;
    this.manualRowSelectionPrint = false;
    this.printButtonEnabled = false;
    this.initialSortColumn = "applicationName";
    this.dataSourceReports.data = [];
    switch (value) {
      case 'Hold': this.searchByValue = this.searchValue;
        this.setDropDownValues(this.searchActiveDef);
        this.tableColumns = this.holdOptionColumns;
        this.setColumnNames(this.tableColumns);
        break;
      case 'Customer Type': this.searchByValue.push(this.default);
        for (let i = 0; i < this.flagArray.length; i++) {
          this.searchByValue.push(this.flagArray[i].description);
        }
        this.setDropDownValues(this.searchActiveDef);
        this.tableColumns = this.customerTypeOptionColumns;
        this.setColumnNames(this.tableColumns);
        break;
      case 'Print/Mail': this.searchByValue.push(this.default);
        this.setDropDownValues(this.searchActiveDef);
        this.tableColumns = this.printOptionColumns;
        this.setColumnNames(this.tableColumns);
        this.manualRowSelectionPrint = true;
        break;
      case 'Email Address': this.searchByValue.push(this.default);
        for (let i = 0; i < this.flagArray.length; i++) {
          this.searchByValue.push(this.flagArray[i].description);
        }
        this.setDropDownValues(this.searchActiveOnly);
        this.tableColumns = this.emailAddressOptionColumns;
        this.setColumnNames(this.tableColumns);
        break;
      case 'PDF': this.searchByValue = this.searchValue;
        this.setDropDownValues(this.searchActiveDef);
        this.tableColumns = this.pdfOptionColumns;
        this.setColumnNames(this.tableColumns);
        break;
      case 'EBPP': this.searchByValue = this.searchValue;
        this.setDropDownValues(this.searchActiveDef);
        this.tableColumns = this.ebppOptionColumns;
        this.setColumnNames(this.tableColumns);
        break;
      case 'Bill Type': this.searchByValue.push(this.default);
        this.setDropDownValues(this.searchActiveDef);
        this.tableColumns = this.billTypeOptionColumns;
        this.setColumnNames(this.tableColumns);
        this.manualRowSelection = true;
        break;
      case 'Customer Information': this.searchByValue.push(this.default);
        this.setDropDownValues(this.searchActive);
        this.tableColumns = this.clientSalesOptionColumns;
        this.setColumnNames(this.tableColumns);
        this.initialSortColumn = "customerName";
        break;

    }
    if(!this.fromReset){
      this.sort.active = this.initialSortColumn;
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({active: this.initialSortColumn, direction: 'asc'});
    }
    else{
      this.fromReset=false;
    }
   
    this.reportsForm.controls['searchValue'].setValue(this.searchByValue[0]);
    this.reportsForm.controls['searchStatus'].setValue(this.searchStatus[0]);
  }
  //Sets the active and inactive status in the active / inactive drop down.
  setDropDownValues(data) {
    for (let i = 0; i < data.length; i++) {
      this.searchStatus.push(data[i]);
    }
  }

  // To Load FlagType data.
  loadAllFlagtypes() {
    this.allFlagtypes = this.flagtypeservice.getAllFlagtypes(false);
    this.allFlagtypes.subscribe(results => {
      if (!results) { return };
      this.flagArray = results;
    //Setting default values when page loads.
    this.loadSearchCriteria();
      this.flagArray.sort((a, b) => (a.description.toLowerCase() > b.description.toLowerCase()) ? 1 : ((b.description.toLowerCase() > a.description.toLowerCase()) ? -1 : 0));
    },
      (error) => {
        console.log(error);
      });
  }

  //Builds the object based on the user selection in the drop down.
  async submitData() {
    let searchObject, value1 = null, value2 = null;
    switch (this.reportsForm.controls['searchBy'].value) {
      case 'Hold':
        value1 = this.reportsForm.controls['searchValue'].value == 'Yes' ? true : false;
        if (this.reportsForm.controls['searchStatus'].value != 'All') {
          value2 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        }
        searchObject = {
          'hold': value1,
          'active': value2,
        }
        break;
      case 'Customer Type':
        if (this.reportsForm.controls['searchValue'].value != 'All') {
          let index = this.flagArray.findIndex(x => x.description == this.reportsForm.controls['searchValue'].value);
          value1 = "" + this.flagArray[index].flagId;
        }
        if (this.reportsForm.controls['searchStatus'].value != 'All') {
          value2 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        }
        searchObject = {
          'customerFlag': value1,
          'active': value2,
        }


        break;
      case 'Print/Mail':
        if (this.reportsForm.controls['searchStatus'].value != 'All') {
          value1 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        }
        searchObject = {
          'active': value1,
        }

        break;
      case 'Email Address':
        if (this.reportsForm.controls['searchValue'].value != 'All') {
          let index = this.flagArray.findIndex(x => x.description == this.reportsForm.controls['searchValue'].value);
          value1 = "" + this.flagArray[index].flagId;
        }
        value2 = true;
        searchObject = {
          'customerFlag': value1,
          'active': value2,
        }
        break;
      case 'PDF':
        value1 = this.reportsForm.controls['searchValue'].value == 'Yes' ? true : false;
        if (this.reportsForm.controls['searchStatus'].value != 'All') {
          value2 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        }
        searchObject = {
          'pdf': value1,
          'active': value2,
        }

        break;
      case 'EBPP':
        value1 = this.reportsForm.controls['searchValue'].value == 'Yes' ? true : false;
        if (this.reportsForm.controls['searchStatus'].value != 'All') {
          value2 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        }
        searchObject = {
          'abpp': value1,
          'active': value2,
        }

        break;
      case 'Bill Type':
        if (this.reportsForm.controls['searchStatus'].value != 'All') {
          value1 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        }
        searchObject = {
          'active': value1,
        }
        break;
      case 'Customer Information':
        value1 = this.reportsForm.controls['searchStatus'].value == 'Active' ? true : false;
        searchObject = {
          'clientActive': value1,
        }
        break;

    }
    this.searchDataInDb(searchObject)
  }

  //Performs the search in the db based on given inputs.
  searchDataInDb(object) {
    let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
    let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.reportsScreenName) : -1;
    if (index == -1) {
      searchCriteriaObj.push({
        screenName: Constants.reportsScreenName
        , searchBy: this.reportsForm.controls['searchBy'].value
        , searchOption: this.reportsForm.controls['searchValue'].value
        , searchStatus: this.reportsForm.controls['searchStatus'].value
      });
    }
    else {
      searchCriteriaObj[index].searchBy = this.reportsForm.controls['searchBy'].value;
      searchCriteriaObj[index].searchOption = this.reportsForm.controls['searchValue'].value;
      searchCriteriaObj[index].searchStatus = this.reportsForm.controls['searchStatus'].value;
    }
    localStorage.setItem("searchCriteriaObj", JSON.stringify(searchCriteriaObj));

    this.hideSpinner = true;
    this.dataSourceReports.data = [];
    this.reportsService.getApplicationsBasedOnSearch(object).subscribe(results => {
      this.dataSourceReports.data = [];
      this.dataSourceReports.data = results;
      this.dataSourceReports.sort = this.sort;
      if (this.dataSourceReports.data.length > 0) {
        this.isTableHasData = true;
        this.printButtonEnabled = true;
      
      }
      else {
        this.isTableHasData = false;
        this.printButtonEnabled = false;
      }
      this.hideSpinner = false;
    },
      (error) => {
        this.hideSpinner = false;
        console.log(error);
      }
    )

  }

  //Resets the form to initial state.
  resetForm() {
    this.fromReset=true;
    this.dataSourceReports.data = [];
    this.loadSearchCriteria();
    this.isTableHasData = true;
    this.printButtonEnabled = false;
    this.setFocus();
  }

  //Export to csv
  exportDataToCSV(){
    var dateObj = new Date();
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();
    let newdate = month + "/" + day + "/" + year+"_"+dateObj.getHours()+"_"+dateObj.getMinutes()+"_"+dateObj.getSeconds();
    let fileName="Reports_CSV_"+this.reportsForm.controls['searchStatus'].value+"_"+this.reportsForm.controls['searchBy'].value +"_"+this.reportsForm.controls['searchValue'].value +"_"+ newdate;
    const options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: false,
      title: fileName,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: false,
      filename:fileName,
     headers: this.csvColumnNames,
    };
    
     const csvExporter = new ExportToCsv(options);
      let finalData=[];
     for (let i = 0; i < this.dataSourceReports.data.length; i++) {
      this.tableRowData = [];
      let temp = {};
      for (let j = 0; j < this.resultColumnNames.length; j++) {
        let columnName = this.resultColumnNames[j];
        if(this.dataSourceReports.data[i][columnName]!=null){
          columnName == 'runFrequency' ? temp[columnName.toLowerCase()] = this.obj_RunFrequency[this.dataSourceReports.data[i][columnName]] : temp[columnName.toLowerCase()] = this.dataSourceReports.data[i][columnName];
        }
        else{
          temp[columnName.toLowerCase()] ='';
        }
        
      }

      finalData.push(temp);
     }
     csvExporter.generateCsv(finalData);
  }

  //convert raw data 
  convertData(value, columnName) {
    if (columnName == 'runFrequency') {
      if (value != null && value != '') {

        return this.obj_RunFrequency[value];
      }
      else {
        return "";
      }

    }
    return value;

  }

  //Generate reports
  generateReports() {
    this.dataSourceReports.sortData(this.dataSourceReports.filteredData,this.dataSourceReports.sort);
    if (this.dataSourceReports.data.length > 0) {
      var doc;
      let searchStatus = this.reportsForm.controls['searchStatus'].value;
      doc = new jsPDF('landscape');
      doc.setProperties({
        title: 'Reports',
        subject: 'Search Data Report',
        author: 'LPS',
        creator: 'Arista LPS'
      });
      doc.setFontSize(10);
      doc.setTextColor(175, 171, 171);
      doc.text("Printed on " + new Date().toLocaleString(), 230, 5);
      doc.addImage(aristalogo.base64Image, 'JPEG', 20, 7, 38, 24);
      doc.setTextColor(0, 0, 0);
      doc.setFontType("bold");
      doc.setFontSize(14);
      doc.text(this.reportsForm.controls['searchBy'].value + " Report", 140, 20);
      doc.setFontSize(12);
      doc.rect(14, 33, 269, 15);
      doc.setFontType("bold");
      doc.text("Option:", 50, 42);
      doc.setFontType("normal");
      doc.text(this.reportsForm.controls['searchValue'].value, 66, 42);
      doc.setFontType("bold");
      doc.text("Active:", 140, 42);
      doc.setFontType("normal");

      if (searchStatus == 'All') {
        doc.text('All', 156, 42);
      } else if (searchStatus == 'Active') {
        doc.text('Yes', 156, 42);
      } else if (searchStatus == 'Inactive') {
        doc.text('No', 156, 42);
      }


      this.tableResultsFinalData = [];
      let columnsDeclaration = [];
      for (let i = 0; i < this.dataSourceReports.data.length; i++) {
        this.tableRowData = [];
        let temp = {};
        for (let j = 0; j < this.resultColumnNames.length; j++) {
          let columnName = this.resultColumnNames[j];
          columnName == 'runFrequency' ? temp[columnName.toLowerCase()] = this.obj_RunFrequency[this.dataSourceReports.data[i][columnName]] : temp[columnName.toLowerCase()] = this.dataSourceReports.data[i][columnName];

          if (i == 0) {
            let column = { "header": this.tableColumnNames[j], "dataKey": columnName.toLowerCase(),"fontSize":7 };
            columnsDeclaration.push(column);
          }
        }
        this.tableResultsFinalData.push(temp);
      }

      let totalPagesExp = "";
      doc.autoTable({
        theme: 'grid',
        columnStyles: this.columnFormats,
        body: this.tableResultsFinalData,
        columns: columnsDeclaration,
        margin: { top: 50 },
        styles: { fontSize: 8 },
        didDrawPage: data => {
          let footerStr = "Page " + doc.internal.getNumberOfPages();
          data.settings.margin.top = 14.111111111111109;
          data.doc.setFontSize(10);
          data.doc.text(footerStr, data.cursor.x - 20, data.cursor.y + 10);
        },
      })
      if (typeof doc.putTotalPages === 'function') {
        totalPagesExp = doc.internal.getNumberOfPages();
        doc.putTotalPages(totalPagesExp);
      }

      window.open(doc.output('bloburl'));

    }


  }

}

