import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, ElementRef, QueryList } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource, MatPaginator, MatRadioButton, MatRadioGroup, ErrorStateMatcher } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { InsertService } from '../../../businessservices/insert/insert.service';
import { Inserts } from '../../../businessclasses/Inserts/Insert';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { PopupDialogService } from '../../../shared/popup-dialog.service';
import { Router } from '@angular/router';
import { CustomerService } from '@/businessservices/customer/customer.service';
import { Customer } from '@/businessclasses/Customer/customer';
import { Application } from '../../../businessclasses/application/application';
import { ApplicationService } from '../../../businessservices/application/application.service';
import { MessageConstants } from '@/shared/message-constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ExportToCsv } from 'export-to-csv';
import { aristalogo } from '@/shared/aristalogo';
@Component({
	selector: 'app-viewinsert',
	templateUrl: './viewinsert.component.html',
	styleUrls: ['./viewinsert.component.css'],

})
export class ViewinsertComponent implements OnInit {
	tabIndexCount=0;
	spinnerText = MessageConstants.SPINNERTEXT;
	hideSpinner = false;
	spinnerFlag = 0;
	checked = false;
	ifDateSelected = true;
	InsertsList = [];
	InsertsListFiltered = [];
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
	viewInsertsFormData: any;
	tempArray = [];
	isTableHasData = true;
	datemask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];
	errorMatcher = new CrossFieldErrorMatcher();
	dataSourceviewInsert = new MatTableDataSource<Inserts>();
	allInserts: Observable<Inserts[]>;
	searchData=[]; // To save the current search data to use in pdf
	@ViewChild('sort') sort: MatSort;
	@ViewChildren('formRow') rows: QueryList<any>
	@ViewChildren('formRowStartDate') startDateFocus: QueryList<any>
	

	@ViewChild('customerNameAuto') customerNameAuto: ElementRef;
	@ViewChildren('customerCodeAuto') customerCodeAuto: ElementRef;
	@ViewChildren('customerNameAuto') focusedElement: QueryList<any>;
	@ViewChildren('customerCodeAuto') focusedCodeElement: QueryList<any>;

	highlightedRows = [];
	viewInsertsForm: FormGroup;
	insertColumns: string[] = ['applicationCode',
		'startDate',
		'endDate',
		'insertType',
		'number',
		'returnInserts',
		'returnedQuantity',
		'usedQuantity',
		'weight',
		'reorderQuantity',
		'receivedQuantity',
		'receivedDate',
		'receivedBy',
		'binLocation',
		'description',
		'active',
		'locationInserts',

	];
	insertColumnsPdf: string[] = ['App',
		'Start Date',
		'End Date',
		'Type',
		'Insert Number',
		'Return',
		'Return Quantity',
		'Used Quantity',
		'Weight',
		'Reorder Quantity',
		'Received Quantity',
		'Received Date',
		'Received By',
		'Bin',
		'Desc',
		'Active',
		'Loc',
	];
	  //column Formats
	  columnFormats ={
		  'applicationcode':{halign: 'left', fontSize: 7 ,overflow:'linebreak',cellWidth:10},
		  'startdate':{halign: 'center', fontSize: 7 ,overflow:'linebreak',cellWidth:13},
		  'enddate':{halign: 'center', fontSize: 7 ,overflow:'linebreak',cellWidth:13},
		  'inserttype':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:11},
		  'number':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:14},
		  'returninserts':{halign: 'center', fontSize: 7 ,overflow:'linebreak',cellWidth:14},
		  'returnedquantity':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:16},
		  'usedquantity':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:18},
		  'weight':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:13},
		  'reorderquantity':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:15},
		  'receivedquantity':{halign: 'right', fontSize: 7 ,overflow:'linebreak',cellWidth:16},
		  'receiveddate':{halign: 'center', fontSize: 7 ,overflow:'linebreak',cellWidth:17},
		  'receivedby':{halign: 'left', fontSize: 7 ,overflow:'linebreak',cellWidth:16},
		  'binlocation':{halign: 'left', fontSize: 7 ,overflow:'linebreak',cellWidth:15},
		  'description':{halign: 'left', fontSize: 7 ,overflow:'linebreak',cellWidth:19},
		  'active':{halign: 'center', fontSize: 7 ,overflow:'linebreak',cellWidth:13},
		  'locationinserts':{halign: 'center', fontSize: 7 ,overflow:'linebreak',cellWidth:15},

	  };

	  // this.columnFormats[dataColumns['tableName'].toLowerCase()] = { halign: dataColumns['textAlign'], fontSize: 7 ,overflow:'linebreak',cellWidth:dataColumns['cellWidth']};
	printButtonEnabled: boolean = false;
	constructor(private formbulider: FormBuilder,
		private applicationservice: ApplicationService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private popupdlgService: PopupDialogService,
		private customerservice: CustomerService,
		private datePipe: DatePipe,
		private router: Router, private insertservice: InsertService) { }

	ngOnInit() {
		this.viewInsertsForm = this.formbulider.group({
			CustomerName: ['', []],
			CustomerCode: ['', []],
			active: [true, []],
			startDateInViewInserts: ['', [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			startDateInViewInserts1: ['', []],
			endDateInViewInserts: ['', [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
			endDateInViewInserts1: ['', []]
		});
		if (localStorage.getItem("viewInsertsData") === null) {
			this.setFocus();
		}

		if (localStorage.getItem("viewInsertsData") != null && localStorage.getItem('backToViewInserts') == 'clicked') {
			const InsertsData = JSON.parse(localStorage.getItem("viewInsertsData"));
			if (InsertsData.CustomerName) {
				this.viewInsertsForm.controls['CustomerName'].setValue({ customerName: InsertsData.CustomerName['customerName'] || InsertsData.CustomerName });
			}
			if (InsertsData.CustomerCode) {
				this.viewInsertsForm.controls['CustomerCode'].setValue({ applicationCode: InsertsData.CustomerCode['applicationCode'] || InsertsData.CustomerCode });
			}
			this.viewInsertsForm.controls['startDateInViewInserts'].setValue(InsertsData.startDateInViewInserts);
			this.viewInsertsForm.controls['endDateInViewInserts'].setValue(InsertsData.endDateInViewInserts);
			this.viewInsertsForm.controls['active'].setValue(InsertsData.active);
			localStorage.removeItem('viewInsertsData');
			localStorage.removeItem('backToViewInserts');
			//this.dataSourceviewInsert = new MatTableDataSource<Inserts>();
			this.dataSourceviewInsert.data = JSON.parse(localStorage.arrayList);
			this.printButtonEnabled = true;
			this.dataSourceviewInsert.sort = this.sort;
			this.viewInsertsFormData = InsertsData;
			this.setFocusForStartDate();
			this.tempArray = JSON.parse(localStorage.arrayList);
			this.loadDataInGrid();
			localStorage.removeItem('arrayList');
			localStorage.removeItem("custCodeForEditInsert")
			localStorage.removeItem('startDateForEditInsert')
			localStorage.removeItem('endDateForEditInsert')
		}

		this.loadCustomerList();
		this.loadApplicationList();
		//this.loadInsertList();
		this.dataSourceviewInsert.sortingDataAccessor = (data: any, sortHeaderId: string): any => {
			switch (sortHeaderId) {
				case 'startDate': return new Date(data.startDate);
				case 'endDate': return new Date(data.endDate);
				case 'receivedDate': return new Date(data.receivedDate);
			  }
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};

		
	}

	

	//to initialize customer name 
	initializeAutocompleteCustomer() {
		this.filteredOptionsCustomer = this.viewInsertsForm.controls['CustomerName'].valueChanges
			.pipe(
				startWith<string | Customer>(''),
				map(value => typeof value === 'string' ? value : value.customerName),
				map(customername => customername ? this._filter(customername) : this.customerDetails.slice())
			);
	}

	//initialize auto complete customer code
	initializeAutoCompleteCustomerCode() {
		this.filteredOptionsCustomerCode = this.viewInsertsForm.controls['CustomerCode'].valueChanges
			.pipe(
				startWith<string | Application>(''),
				map(value => typeof value === 'string' ? value : value.applicationCode),
				map(ccode => ccode ? this._filterCustCode(ccode) : this.applicationDetails.slice()),
				map(ccode => ccode.sort((a, b) => (a.applicationCode > b.applicationCode) ? 1 : ((b.applicationCode > a.applicationCode) ? -1 : 0)))
			);
	}


	displayFn(user?: Customer): string | undefined {
		return user ? user.customerName : undefined;
	}

	displayFnCustCode(user?: Application): string | undefined {
		return user ? user.applicationCode : undefined;
	}

	private _filter(name: string): Customer[] {
		const filterValue = name.toLowerCase();
		return this.customerDetails.filter(option => option.customerName.toLowerCase().indexOf(filterValue) === 0);
	}
	// For Cust code.
	private _filterCustCode(name: string): Application[] {
		const filterValue = name.toLowerCase();
		return this.applicationDetails.filter(option => option.applicationCode.toLowerCase().indexOf(filterValue) === 0);
	}

	//  On Customer  Dropdown change
	isChangeInCustomer(customerObject, isAC) {
		this.viewInsertsForm.controls['CustomerCode'].setValue('');
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
			this.viewInsertsForm.controls['CustomerCode'].setValue({ applicationCode: this.applicationDetails[0].applicationCode });
		  }else if( this.applicationDetails.length>=1){
			this.setFocusToCode();
		  }
		  if(selectedClient == null && cName != null && cName != ""){
			this.viewInsertsForm.controls['CustomerName'].setErrors({'incorrectCustomerName': true});
		  }
		  this.initializeAutoCompleteCustomerCode();
	   
		}
	  }
	
	  ViewAdditionalChargesCustomerCode(eventObj) {
		if (eventObj.srcElement.value === "" && this.applicationArray.length === this.applicationDetails.length) {
		  this.viewInsertsForm.controls["CustomerCode"].setValue("");
		  this.viewInsertsForm.controls["CustomerName"].setValue("");
		 this.viewInsertsForm.controls["CustomerCode"].setErrors(null);
		 this.viewInsertsForm.controls["CustomerName"].setErrors(null);
		  this.applicationDetails = this.applicationArray;
		  //this.initializeAutoCompleteCustomerCode();
		}
		else {
		  this.isChangeInApplication(eventObj, false);
		}
	  }


	  isChangeInApplication(applicationObject: any, isAC) {
		let typeOfCode = typeof this.viewInsertsForm.controls['CustomerCode'].value;
		let cCode ;
		if(typeOfCode == 'string'){
		  cCode = this.viewInsertsForm.controls['CustomerCode'].value
		}else{
		  cCode = this.viewInsertsForm.controls['CustomerCode'].value.applicationCode;
		}
		let foundFlag = false;
		if (cCode != null) {
		  let client = this.applicationDetails.find(x => x.applicationCode.toLowerCase() == cCode.toLowerCase())
		  for (let name of this.customerDetails) {
			if (client && name.customerId === client.clientID) {
			  this.viewInsertsForm.controls['CustomerName'].setValue({ customerName: name.customerName });
			  foundFlag = true;
			}
		  }
		}
	
		if(!foundFlag && applicationObject.srcElement.value!==""){
		  this.viewInsertsForm.controls['CustomerCode'].setErrors({'incorrect': true});
		}
	
	  }

	checkDates(): boolean {
		let isValid = true;
		let currentEndDate = this.viewInsertsForm.get("endDateInViewInserts").value;
		let currentStartDate = this.viewInsertsForm.get("startDateInViewInserts").value;
		currentEndDate = currentEndDate != "" && currentEndDate != null ? currentEndDate : "";
		if (currentEndDate && currentStartDate) {
			if (new Date(currentEndDate) < new Date(currentStartDate)) {
				isValid = false;
			}
		}
		return isValid;
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
  

	//set focus for start date
	setFocusForStartDate() {
		setTimeout(() => {
			this.startDateFocus.first.nativeElement.focus();
		}, 600);
	}

	
	validateCustomerNameAutoCompletes(eventObj) {
 
		if (eventObj.srcElement.value === "") {
		  this.viewInsertsForm.controls["CustomerName"].setValue("");
		  this.viewInsertsForm.controls["CustomerCode"].setValue("");
		  this.applicationDetails = this.applicationArray;
		  this.initializeAutoCompleteCustomerCode();
		}
		else {
		  this.isChangeInCustomer(eventObj, false);
		}
	  }

	validateCustomerCodeAutoCompletes() {
		let applicationCode = this.viewInsertsForm.get('CustomerCode').value;
		let isFound = false;
		let isempty = false;
		//this.applicationDetails=this.applicationArray;
		let tempName;
		let typeOfvalue = typeof applicationCode;

		for (let name of this.applicationDetails) {
			if (typeOfvalue == 'object') {
				if (applicationCode && name.applicationCode.toLowerCase() == applicationCode.applicationCode.toLowerCase()) {
					isFound = true;
					tempName = name;
				}
				if (!applicationCode) {
					isempty = true;
				}
			} else {
				if (applicationCode && name.applicationCode.toLowerCase() == applicationCode.toLowerCase()) {
					isFound = true;
					let custdata = this.customerDetails.find(x => x.customerId === name.clientID)
					this.viewInsertsForm.controls['CustomerName'].markAsUntouched();
					this.viewInsertsForm.controls['CustomerName'].setValue({ customerName: custdata.customerName })
					this.viewInsertsForm.controls['CustomerCode'].setValue({ applicationCode: name.applicationCode })
					this.viewInsertsForm.controls['CustomerCode'].setErrors(null);
					this.viewInsertsForm.controls['CustomerName'].setErrors(null);
				}
				if (applicationCode == '') {
					isempty = true;
				}
			}

		}
		if (applicationCode && isFound == false) {
			//let response = this.popupService.openAlertDialog("Invalid Customer Code", "Home", "check_circle",false);
		}

		if (isempty) {
			//this.viewInsertsForm.controls['CustomerName'].setValue("");
			//this.viewInsertsForm.controls['CustomerCode'].setValue("");
			// this.applicationDetails=this.applicationArray;
			// this.initializeAutoCompleteCustomerCode(); 
		}
	}



	public DateFieldInViewInsert = [
		{ "id": 0, "name": "(Select)" },
		{ "id": 1, "name": "Start Date" },
		{ "id": 2, "name": "End Date" }
	]
	public selectedDateFieldInViewInsert = -1;
	public filterByInViewInsert = [
		{ "id": 0, "name": "Search by" },
		{ "id": 1, "name": "Description" }
	]

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
	loadInsertList(custName, custCode, startDate, endDate,active) {
		if (custCode) {
			custCode = custCode.applicationCode || custCode
		}
		if (custName) {
			custName = custName.customerName || custName
		}
		this.hideSpinner = true;
		this.searchData[0]=custName!=''?(custName+" ("+(custCode!=''?custCode:'-') +")"):'-';
		this.searchData[1]=startDate!=''?startDate:'-';
		this.searchData[2]=endDate!=''?endDate:'-';
		localStorage.setItem("custCodeForEditInsert", custCode)
		localStorage.setItem('startDateForEditInsert', startDate)
		localStorage.setItem('endDateForEditInsert', endDate)
		const formValue = this.viewInsertsForm.value;

		this.allInserts = this.insertservice.getallInserts(custName, custCode, startDate, endDate,active);
		this.allInserts.subscribe(results => {
			if (!results) { return };
			this.InsertsList = results;
			// this.FilterInsertsResults();
			//this.dataSourceviewInsert = new MatTableDataSource<Inserts>()
			this.dataSourceviewInsert.data = results;
			this.dataSourceviewInsert.sort = this.sort;
			this.dataSourceviewInsert.sortingDataAccessor = (data: any, sortHeaderId: string): any => {
				switch (sortHeaderId) {
					case 'startDate': return new Date(data.startDate);
					case 'endDate': return new Date(data.endDate);
					case 'receivedDate': return new Date(data.receivedDate);
				  }
				if (typeof data[sortHeaderId] === 'string') {
					return data[sortHeaderId].toLocaleLowerCase();
				}
				return data[sortHeaderId];
			};
			this.tempArray = results;
			this.deactiveSpinner();
			this.viewInsertsFormData = this.viewInsertsForm.value;
			if (this.dataSourceviewInsert.data.length > 0) {
				this.printButtonEnabled = true;
				this.isTableHasData = true;
			}
			else {
				this.isTableHasData = false;
				this.printButtonEnabled = false;
			}
		},
			(error) => {
				this.deactiveSpinner();
				this.errorService.handleError(error);
			});
	}

	// Loads data in the grid based on the search criteria.
	loadDataInGrid() {
		if (this.viewInsertsForm.valid) {
			let customerNameValue = this.viewInsertsForm.controls['CustomerName'].value;
			this.tempArray = [];
			this.viewInsertsFormData = null;
			/* if((this.viewInsertsForm.get('CustomerCode').value || this.viewInsertsForm.get('CustomerName').value 
			|| (this.viewInsertsForm.get('startDateInViewInserts').value || this.viewInsertsForm.get('endDateInViewInserts').value))){	 */
			if (this.checkDates()) {
				this.loadInsertList(customerNameValue, this.viewInsertsForm.get('CustomerCode').value, this.viewInsertsForm.get('startDateInViewInserts').value, this.viewInsertsForm.get('endDateInViewInserts').value,this.viewInsertsForm.get('active').value)
			} else {
				this.popupService.openAlertDialog("End Date must be greater than or equal to Start Date.", "Inserts", "check_circle");
			}
			/* }
			else{
				this.popupService.openAlertDialog("Please select either Customer Name or Customer Code or Start Date or End Date" ,"Inserts","check_circle"); 
			} */
		}

	}

	selectRow(row) {
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
	}
	openInsert(applId, insertName, insertNumber) {
		this.id = applId;
		let insertType = insertName + insertNumber.toString();
		localStorage.arrayList = JSON.stringify(this.tempArray);
		localStorage.setItem("viewInsertsData", JSON.stringify(this.viewInsertsFormData));
		localStorage.setItem('backToViewInserts', 'clicked');
		let startDate = this.viewInsertsForm.get('startDateInViewInserts').value;
		let endDate = this.viewInsertsForm.get("endDateInViewInserts").value;
		if (startDate) {
			startDate = startDate.split('/')
			startDate = startDate.join('-')
		} else {
			startDate = "00-00-00"
		}
		if (endDate) {
			endDate = endDate.split('/')
			endDate = endDate.join('-')
		}
		else {
			endDate = "00-00-00"
		}
		this.router.navigate(['./add_insert', this.id, insertType, startDate, endDate]);
	}

	resetForm() {
		this.viewInsertsForm.controls['startDateInViewInserts'].setValue("");
		this.viewInsertsForm.controls['startDateInViewInserts1'].setValue("");
		this.viewInsertsForm.controls['endDateInViewInserts'].setValue("");
		this.viewInsertsForm.controls['endDateInViewInserts1'].setValue("");
		this.viewInsertsForm.controls['CustomerName'].setValue("");
		this.viewInsertsForm.controls['CustomerCode'].setValue("");
		this.viewInsertsForm.controls['active'].setValue(true);
		this.highlightedRows.pop();
		this.dataSourceviewInsert.data = [];
		this.isTableHasData = false;
		this.applicationDetails = this.applicationArray;
		this.initializeAutoCompleteCustomerCode();
		this.initializeAutocompleteCustomer();
		this.setFocus();
		this.printButtonEnabled = false;
	}

	setDateToPicker(controlName1, controlName2) {
		let dateToSet: any = new Date(this.viewInsertsForm.controls[controlName1].value);
		if (dateToSet == "Invalid Date" || this.viewInsertsForm.controls[controlName1].value != null || this.viewInsertsForm.controls[controlName1].value != "") {
			this.viewInsertsForm.controls[controlName2].setValue("");
		}
		else {
			this.viewInsertsForm.controls[controlName2].setValue(dateToSet);
		}
	}

	setDateToControl(event, controlName1, controlName2) {
		var todaysDate = new Date(this.viewInsertsForm.controls[controlName2].value);
		let currentMonth = todaysDate.getMonth() + 1;
		let currentDay = todaysDate.getDate();
		let currentYear = todaysDate.getFullYear();
		let curMonthInString, curDayInString, curYearInString;
		curYearInString = String(currentYear);
		curYearInString.slice(2)
		if (String(currentMonth).length == 1) {
			curMonthInString = "0" + String(currentMonth);
		} else {
			curMonthInString = String(currentMonth);
		}
		if (String(currentDay).length == 1) {
			curDayInString = "0" + String(currentDay);
		} else {
			curDayInString = String(currentDay);
		}
		let currentDate = curMonthInString + "/" + curDayInString + "/" + curYearInString.slice(2);
		this.viewInsertsForm.controls[controlName1].setValue(currentDate);
	}
	public hasError = (controlName: string, errorName: string) => {

		return this.viewInsertsForm.controls[controlName].hasError(errorName);
	}

	// stop the spinner
	deactiveSpinner() {
		this.spinnerFlag++;
		if (this.spinnerFlag == 1) {
			this.hideSpinner = false;
			this.spinnerFlag = 0;
		}
	}

	convertToCustomerDateFormat(inputDate) {
		var outputDate = "";
		if (inputDate == null || inputDate == "") {
			outputDate = inputDate
		}
		else {
			inputDate = new Date(inputDate);
			let month = inputDate.getMonth() + 1 < 10 ? "0" + (inputDate.getMonth() + 1) : inputDate.getMonth() + 1;
			let day = inputDate.getDate() < 10 ? "0" + inputDate.getDate() : inputDate.getDate();
			outputDate = month + "/" + day + "/" + String(inputDate.getFullYear()).substring(2); //+pDate.getHours()+":"+pDate.getMinutes()+":"+pDate.getSeconds();
		}

		return outputDate;
	}

	
  //Export to csv
  exportDataToCSV(){
	this.dataSourceviewInsert.sortData(this.dataSourceviewInsert.filteredData,this.dataSourceviewInsert.sort);
    var dateObj = new Date();
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();
    let newdate = month + "/" + day + "/" + year+"_"+dateObj.getHours()+"_"+dateObj.getMinutes()+"_"+dateObj.getSeconds();
    let fileName="Inserts_CSV_"+newdate;
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
      headers:this.insertColumnsPdf,
    };
    
	 const csvExporter = new ExportToCsv(options);
	 let finalData=[];
      for (let i = 0; i < this.dataSourceviewInsert.data.length; i++) {
        let temp = {};
        for (let j = 0; j < this.insertColumns.length; j++) {
		   
		  let columnName = this.insertColumns[j];
		  if(this.dataSourceviewInsert.data[i][columnName]!=null){
			if(columnName=='active' || columnName=='returnInserts'){
				temp[columnName.toLowerCase()] =this.dataSourceviewInsert.data[i][columnName]==true?'Y':'N';
			  }
			  else if(columnName=='receivedDate'){
				temp[columnName.toLowerCase()] =this.dataSourceviewInsert.data[i][columnName]!=null?this.convertToCustomerDateFormat(this.dataSourceviewInsert.data[i][columnName]):'';
			  }
			  else{
				temp[columnName.toLowerCase()] = this.dataSourceviewInsert.data[i][columnName];
			  }
		  } 
		  else{
			temp[columnName.toLowerCase()] ='';
		  } 
		 
        }
		finalData.push(temp);
      }
     csvExporter.generateCsv(finalData);
  }

  //Generate reports
  generateReports() {
    this.dataSourceviewInsert.sortData(this.dataSourceviewInsert.filteredData,this.dataSourceviewInsert.sort);
    if (this.dataSourceviewInsert.data.length > 0) {
      var doc;
      doc = new jsPDF('landscape');
      doc.setProperties({
        title: 'Inserts',
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
	  doc.text("Inserts Report", 140, 20);
	  doc.setFontSize(12);
      doc.rect(14, 33, 254, 15);
      doc.setFontType("bold");
      doc.text("Customer Name:", 20, 42);
      doc.setFontType("normal");
      doc.text(this.searchData[0], 56, 42);
      doc.setFontType("bold");
      doc.text("Start Date:", 150, 42);
	  doc.setFontType("normal");
	  doc.text(this.searchData[1], 173, 42);
	  doc.setFontType("bold");
	  doc.text("End Date:", 200, 42);
	  doc.setFontType("normal");
	  doc.text(this.searchData[2], 222, 42);
	  let columnsDeclaration = [];
	  let finalData=[];
      for (let i = 0; i < this.dataSourceviewInsert.data.length; i++) {
        let temp = {};
        for (let j = 0; j < this.insertColumns.length; j++) {
		  let columnName = this.insertColumns[j];
		  if(columnName=='active' || columnName=='returnInserts'){
			temp[columnName.toLowerCase()] =this.dataSourceviewInsert.data[i][columnName]==true?'Y':'N';
		  }
		  else if(columnName=='receivedDate'){
			temp[columnName.toLowerCase()] =this.dataSourceviewInsert.data[i][columnName]!=null?this.dataSourceviewInsert.data[i][columnName].split(" ")[0]:'';
		  }
		  else{
			temp[columnName.toLowerCase()] = this.dataSourceviewInsert.data[i][columnName];
		  }
         

          if (i == 0) {
            let column = { "header": this.insertColumnsPdf[j], "dataKey": columnName.toLowerCase(),"fontSize":7 };
            columnsDeclaration.push(column);
          }
        }
		finalData.push(temp);
      }

      let totalPagesExp = "";
      doc.autoTable({
        theme: 'grid',
        columnStyles: this.columnFormats,
        body: finalData,
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
class CrossFieldErrorMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return control.dirty && form.invalid;
	}
}
