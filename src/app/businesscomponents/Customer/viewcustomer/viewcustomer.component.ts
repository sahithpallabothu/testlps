//angular components.
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormBuilder } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

// Business components.
import { Customer } from '../../../businessclasses/customer/customer';
import { CustomerService } from '../../../businessservices/customer/customer.service';

// Popup messages. 
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';

//Constants
import { MessageConstants } from '@/shared/message-constants';
import { Constants } from '@/app.constants';

@Component({
	selector: 'app-viewcustomer',
	templateUrl: './viewcustomer.component.html',
	styleUrls: ['./viewcustomer.component.css']
})
export class ViewcustomerComponent implements OnInit {

	spinnerText = MessageConstants.SPINNERTEXT;
	hideSpinner = false;

	//variable declarations for grid.
	custableColumns: string[] = ['customerName', 'customerCode', 'sedc', 'active', 'telephone', 'fax', 'mailerId', 'crid', 'comment'];
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('filterText') filterText: ElementRef;
	dataSource = new MatTableDataSource<Customer>();
	allCustomerData: Customer[] = [];
	isTableHasData = true;
	//for telephone mask
	telephonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	highlightedRows = [];//highlightedRows
	allCustomers: Observable<Customer[]>;
	searchText: string;
	noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
	ifFilterBySelected: boolean = true;
	isExistInSession: boolean = false;
	public searchOptions = [
		{ "id": 1, "name": "Customer Name" },
		{ "id": 2, "name": "Customer Code" },
		{ "id": 3, "name": "SEDC" },
		{ "id": 4, "name": "Active" },
	]
	public selectedoption = 1;
	id: any;
	constructor(private formbulider: FormBuilder,
		private customerservice: CustomerService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private router: Router) { }

	ngOnInit() {
		this.loadSearchCriteria();
		this.loadWhenClickedFromEditCustomer();

		//To sort based on table header.
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};
	}

	//To select search options.
	checkFilterBySelected() {
		this.ifFilterBySelected = this.selectedoption == 1 ? true : false;
		this.searchText = "";
		this.setFocus();
	}

	// Used to set the focus for the first field.
	setFocus() {
		setTimeout(() => {
			this.filterText.nativeElement.focus();
		}, 0);
	}

	addPatternToNumber(contactNumber){
		return contactNumber? "("+contactNumber.substring(0, 3)+") "+contactNumber.substring(3, 6)+"-"+contactNumber.substring(6, 9) : '';
	}


	loadSearchCriteria() {
		//Department
		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.ViewEditCustomerSubmenu) : -1;
		if (index == -1) {
			this.selectedoption = 1;
			this.isExistInSession = false;
		}
		else {
			this.selectedoption = searchCriteriaObj[index].searchBy;
			this.isExistInSession = true;
		}
	}


	//Navigate to Customer Screen on clicking the row in grid.
	openCustomerScreen(row) {
		this.id = row.customerId;
		this.router.navigate(['./add_customer', this.id]);
		var searchCriteria = {
			"selectedValue": this.selectedoption,
			"searchText": this.searchText
		}
		localStorage.setItem("searchCriteria", JSON.stringify(searchCriteria));
	}

	//Load all Customers.
	async loadAllCustomers() {
		this.hideSpinner = true;
		this.allCustomers = await this.customerservice.getAllCustomers(true);
		this.allCustomers.subscribe(results => {
			if (!results) { return };
			this.allCustomerData = results;
			this.dataSource.data = results;
			this.dataSource.sort = this.sort;
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
			this.hideSpinner = false;
		},
			(error) => {
				this.hideSpinner = false;
				this.errorService.handleError(error);
			});
	}

	//To persist customer data.
	async loadWhenClickedFromEditCustomer() {
		if (localStorage.getItem('searchCriteria') != null && localStorage.getItem('fromEditCustomer') == 'clicked') {
			const searchCriteria = JSON.parse(localStorage.getItem("searchCriteria"));
			this.selectedoption = searchCriteria.selectedValue;
			this.searchText = searchCriteria.searchText;
			this.ifFilterBySelected = false;
			if (this.searchText == '' || this.searchText == undefined) {
				await this.loadAllCustomers();
			}
			else {
				await this.searchCustomerData(searchCriteria.selectedValue, searchCriteria.searchText);
			}

			localStorage.removeItem('searchCriteria');
			localStorage.removeItem('fromEditCustomer');
		}
	}

	//To filter data in the grid.
	public searchCustomerData(selectedVal: number, filterValue: string) {
		let selectedOption = selectedVal == 1 ? 'custName' : selectedVal == 2 ? 'custCode' : selectedVal == 3 ? 'SEDC' : 'Active'
		let selectedText = (filterValue && filterValue.length > 0) ? filterValue.trim() : filterValue;
		if (((filterValue && filterValue.trim() != "") && filterValue != null && filterValue != undefined)) {
			if (selectedText.indexOf('*') == -1) {
				selectedText += '*'
			}
			selectedText = "'" + selectedText.replace(/'/g, "''") + "'";
			if (selectedOption == 'SEDC' || selectedOption == 'Active') {
				let result = this.validateSearchText(filterValue.toLowerCase().trim());
				if (result == null) {
					this.popupService.openAlertDialog('Please enter valid Search Text.', "Customer", "check_circle", false)
				}
				selectedText = result;
				selectedText = "" + selectedText + "";
			}
			var searchObj = {
				"selectedValue": selectedOption,
				"searchText": selectedText
			}
			this.hideSpinner = true;
			this.customerservice.getViewCustomers(searchObj).subscribe(results => {
				if (!results) {
					this.hideSpinner = false;
					return;
				}
				this.dataSource.data = results;
				this.dataSource.sort = this.sort;
				this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
				this.hideSpinner = false;
			},
				(error) => {
					this.hideSpinner = false;
					this.errorService.handleError(error);
				});
		}
		else if ((filterValue == null || filterValue.trim() == "" || filterValue == undefined)) {
			this.loadAllCustomers();
		}

		let searchCriteriaObj = JSON.parse(localStorage.getItem("searchCriteriaObj") || "[]");
		let index = searchCriteriaObj.length > 0 ? searchCriteriaObj.findIndex(x => x.screenName == Constants.ViewEditCustomerSubmenu) : -1;
		if (index == -1) {
			this.isExistInSession = true;
			searchCriteriaObj.push({ screenName: Constants.ViewEditCustomerSubmenu, searchBy: selectedVal });
		}
		else {
			searchCriteriaObj[index].searchBy = selectedVal;
		}
		localStorage.setItem("searchCriteriaObj", JSON.stringify(searchCriteriaObj));
	}

	//To validate Search Text.
	validateSearchText(val) {
		let value;
		val = val.toLowerCase();
		if (val) {
			if (val === 'yes' || val === 'y' || val.indexOf('y') != -1) {
				value = 1;
			}
			else if (val === 'no' || val === 'n' || val.indexOf('n') != -1)
				value = 0;
			else
				value = null;
		}
		return value;
	}


	//To highlight selected row.
	selectRow(row) {
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
	}

	//To clear data.
	clearCustomerData() {
		this.dataSource.data = [];
		this.isTableHasData = true;
		this.dataSource.filter = '';
		this.ifFilterBySelected = true;
		this.searchText = '';
		if (!this.isExistInSession) {
			this.selectedoption = 1;
		}
		this.loadSearchCriteria();
		localStorage.removeItem('searchCriteria');
		localStorage.removeItem('fromEditCustomer');
	}

	//To omit special characters.
	omit_special_char(event) {
		var k;
		k = event.charCode;
		if ((k == 42) || (k == 39) || (k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57) || (k == 45)
		|| k == 38 || k == 45 || k == 40 || k == 41 || k == 44 || k == 46) {
			let inputData = event.srcElement.value;
			let maxAllow = 0;
			if (inputData != undefined && inputData != '') {
				if (inputData[inputData.length - 1] == event.key && event.key == '*' || inputData[inputData.length - 1] == event.key && event.key == "'") {
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
		else {
			return false;
		}
	}

}// view customer component ends here.
