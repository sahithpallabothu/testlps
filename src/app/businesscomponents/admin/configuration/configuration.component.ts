import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatInput, MatSort, MatTableDataSource, ErrorStateMatcher } from '@angular/material';
import { Configuration } from '../../../businessclasses/admin/configuration';
import { ConfigurationService } from '../../../businessservices/admin/configuration.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';


@Component({
	selector: 'app-configuration',
	templateUrl: './configuration.component.html',
	styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

	// variable declarations.
	configurationForm: FormGroup;
	isValid: boolean = true;
	afterValidation: any;
	isChangesExists: boolean = false;
	searchText: string;
	idToUpdate :number = 1;
	ifFilterBySelected = true;
	SpaceMessage : string = MessageConstants.LEADINGSPACEMESSAGE;

	// table declarations.
	tableColumns: string[] = ['key','value'];
	dataSource = new MatTableDataSource<Configuration>();
	highlightedRows = [];
	allConfigurations: Observable<Configuration[]>;

	// search no data found.
	isTableHasData = true;
	noDataFound : string =MessageConstants.NODATAFOUNDMESSAGE;
     configuration : any;
	//  to apply sorting for Mat Table.
	@ViewChild(MatSort) sort: MatSort;

	//to set foucs.
	@ViewChild('keyValue') keyValue: ElementRef;
	configurationList :Configuration[] = [];
	errorMatcher = new ErrorMatcher();
	constructor(private formbulider: FormBuilder,
		private configurationService: ConfigurationService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService
	) { }

	ngOnInit() {
		this.configurationForm = this.formbulider.group({
			value: ['', [Validators.required,  Validators.maxLength(100), SpaceValidator.ValidateSpaces]],
			key: ['', []]
		});
		this.loadAllConfigurations();
		this.configurationForm.controls['key'].enable();
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
        };
        this.configurationForm.controls['key'].disable();
	}

	/* // To show validations.
	public hasError = (controlName: string, errorName: string) => {
		return this.configurationForm.controls[controlName].hasError(errorName);
	} */

	// to load Apptype data.
	loadAllConfigurations() {
		this.allConfigurations = this.configurationService.getAllCongfigurations();
		this.allConfigurations.subscribe(results => {
			if (!results) { return };
            this.dataSource.data = results;
			this.configurationList = results;
            this.dataSource.sort = this.sort;
            this.configurationForm.controls['value'].setValue(this.dataSource.data[0].value);
		    this.configurationForm.controls['key'].setValue(this.dataSource.data[0].key);
			this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
		},
		(error) => {
			this.errorService.handleError(error);
		});
    }
    

	onFormSubmit() {
		 this.configuration = this.configurationForm.value;

		if(this.isChangesExists)
		{
			this.afterValidation  = this.validateConfiguration(this.configuration)
			if (this.afterValidation) {
			   if (this.idToUpdate != null && this.isChangesExists){
					this.updateConfigurationData(this.configuration);
			   }
            }
        }
		else
		{
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Configuration", "check_circle");
		}
	}

	//search options
	public searchOptions = [
		{"id": 0, "name": "Search by"},
		{"id": 1, "name": "Key"},
		{"id": 2, "name": "Value"}

	];

	public selectedoption = -1;
	//on change in serch by drop down
	checkFilterBySelected(){
		this.ifFilterBySelected =  this.selectedoption==0 ? true : false;
		this.searchText = "";
	}

	// search elements in table. 
	public doFilter(selectedVal:number,filterValue: string) {		
		if(filterValue)
		{
			this.dataSource.filterPredicate =(data: any, filter: any)=>
			{
				 if(selectedVal==1){
						return data.key.toLowerCase().indexOf(filter) != -1;  
				 }
				 else if(selectedVal==2){
						return data.value.toLowerCase().indexOf(filter) != -1;        
				 }
				 
			}
			this.dataSource.filter = filterValue.trim().toLowerCase();
			this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;							
		}
		else{
				this.dataSource = new MatTableDataSource<Configuration>(); 
				this.loadAllConfigurations();			
		}
	}
	
	//Form field change event.
	isChange() {
		this.isChangesExists = true;
	}

	setConfigurationChanges(value: boolean) {
		this.isChangesExists = value;
	}

	// validation for duplicate description.
	validateConfiguration(oConfiguration: Configuration): boolean {
		this.isValid = true;
		this.configurationList.forEach(item => {
            if(item.id == this.idToUpdate)
			{
				if (item.value.toLowerCase().trim() === oConfiguration.value.toLowerCase().trim() && this.isChangesExists) {
                    this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Configuration", "check_circle");
					this.isChangesExists = false;
                    return this.isValid;
                   
                }
    		}
		});
			 
	/* 	if (!this.isValid) {
			this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Configuration", "check_circle");
			return this.isValid;
		} */
		return this.isValid;
	}

	// To highlight the selected row in the grid.
	selectRow(row) {
		this.highlightedRows.pop();
		this.highlightedRows.push(row);
		this.setConfigurationChanges(false);
		this.loadConfigurationToEdit(row);
	}

	// to update Apptype data.
	loadConfigurationToEdit(row: any) {
		this.idToUpdate = row.id;
		this.configurationForm.controls['value'].setValue(row.value);
        this.configurationForm.controls['key'].setValue(row.key);
        this.configurationForm.controls['key'].disable();
	}

	

	// Update Configuration Data.
	async updateConfigurationData(oConfiguration: Configuration) {
		const userresponse1 = await this.popupService.openConfirmDialog(MessageConstants.UPDATECONFIRMMESSAGE, "help_outline");
		if (userresponse1 === "ok") {
			oConfiguration.id = this.idToUpdate;
			this.configurationService.updateCongfiguration(oConfiguration).subscribe(() => {
				this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Configuration", "check_circle");
				this.loadAllConfigurations();
				this.ResetChanges();
				this.configurationForm.controls['key'].enable();
			},
				(error) => {
					//this.key.nativeElement.focus();
					this.errorService.handleError(error);
				});
		}
	}

	


ResetChanges() {
	this.configurationForm.reset();
	this.highlightedRows.pop();
	this.idToUpdate = null;
	this.isValid = true;
	this.setConfigurationChanges(false);
}

	

}// Component ends here






