import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';

import{SoftwareService} from '../../../businessservices/admin/software.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { ErrorMatcher } from '@/shared/errorMatcher';

import { UserPrivilegesService } from '@/_services';
import { Constants } from '@/app.constants';
import { Software } from '@/businessclasses/admin/software';
import { HostListener } from '@angular/core';
@Component({
  selector: 'app-software',
  templateUrl: './software.component.html',
  styleUrls: ['./software.component.css']
})
export class SoftwareComponent implements OnInit {

 	//Variable declarations.
   tableColumns: string[] = ['software', 'active'];
   dataSource = new MatTableDataSource<Software>();
   @ViewChild(MatSort) sort: MatSort;
 
   highlightedRows = [];
   // search no data found
   isTableHasData = true;
   RateSelect = null;
   recordIdToUpdate = null;
 
   allSofware: Observable<Software[]>;
   errorMatcher = new ErrorMatcher();
   softwareForm: FormGroup;
 
   //allRunTypeOrders: Observable<Runtypeorder[]>;
   isUpdate: boolean = false;
   RunTypeSelect = null;
   currentRecordID: number;
   totalCount: number;
   softwareList: any = [];
   rateIdentifierName: string;
   searchText: string;
   ifFilterBySelected = true;
   isValid: boolean = true;
   result: any;
   isChangesExists: boolean = false;
   isRateIdentifierChanged: boolean = false;
   noDataFound: string = MessageConstants.NODATAFOUNDMESSAGE;
   public index: Number;
 
   isDescriptionChanged: boolean = false;
   isInUse: boolean = false;
   currentRowIndex: number = -1;
   @ViewChild('software') software: ElementRef;
   fromSave: boolean = false;
   hasScreenUpdatePriviledge = false;
   hasScreenInsertPriviledge = false;
   hasScreenDeletePriviledge = false;
   isAllowSave: boolean = false;
   SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
 
   constructor(private formbulider: FormBuilder,
     private errorService: ErrorHandlerService,
     private popupService: PopupMessageService,
     private softwareService: SoftwareService,
     private userPrivilegesService: UserPrivilegesService,
   ) {
     //Set Department screen privileges
     if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.adminScreenName)) {
       this.hasScreenUpdatePriviledge = true;
     }
     if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.adminScreenName)) {
       this.hasScreenInsertPriviledge = true;
     }
     if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.adminScreenName)) {
       this.hasScreenDeletePriviledge = true;
       this.tableColumns = ['software', 'active', 'delete'];
     }
   }
 
   ngOnInit() {
     this.softwareForm = this.formbulider.group({
       software: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
       active: ['true', []]
     });
 
     this.loadallSofware();
     this.dataSource.sort = this.sort;
     this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
       if (typeof data[sortHeaderId].toLocaleLowerCase() === 'string') {
         return data[sortHeaderId].toLocaleLowerCase();
       }
       return data[sortHeaderId];
     };
 
     this.setSaveBtnEnable()
     this.setFocus();
   }
 
   //To set focus for first control in the form. 
   setFocus() {
     setTimeout(() => {
       this.software.nativeElement.setSelectionRange(this.software.nativeElement.value.length, this.software.nativeElement.value.length);
       this.software.nativeElement.focus();
     }, 0);
   }
 
   //Privilages
   setSaveBtnEnable() {
     if (this.hasScreenInsertPriviledge && this.recordIdToUpdate == null) {
       this.isAllowSave = true;
     } else if (this.hasScreenUpdatePriviledge && this.recordIdToUpdate !== null) {
       this.isAllowSave = true;
     }
     else {
       this.isAllowSave = false;
     }
   }
 
   //Load all Rates.
   async loadallSofware() {
     await this.softwareService.getAllSoftwares().subscribe(results => {
       if (!results) { return };
       this.dataSource.data = results;
       this.softwareList = results;
       this.dataSource.sort = this.sort;
       this.isTableHasData = this.dataSource.data.length > 0 ? true : false;
 
       if (this.currentRowIndex >= 0) {
         this.loadSoftwareToEdit(this.dataSource.data[this.currentRowIndex])
       }
     },
       (error) => {
         this.errorService.handleError(error);
       });
   }
 
 
   // form fields text changes.
   isChange() {
     this.isChangesExists = true;
     this.isDescriptionChanged = true;
   }
 
 
   onFormSubmit() {
     const rates = this.softwareForm.value;
     this.isDescriptionChanged = false;
     this.dataSource.data.forEach(item => {
       if (item.id != this.recordIdToUpdate) {
         if (item.software.toLowerCase().trim() === rates.software.toLowerCase().trim()) {
           this.isDescriptionChanged = true;
         }
       }
     });
     if (!this.ValidatepRate() && !this.isDescriptionChanged) {
       if (this.recordIdToUpdate == null) {
         this.createSoftware(rates);
       }
       else if (this.recordIdToUpdate != null && (this.isChangesExists || this.isDescriptionChanged)) {
         this.updateSoftware(rates);
       }
     }
 
     else {
       if (this.isDescriptionChanged) {
         this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Software", "check_circle", false);
       }
       else {
         this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Software", "check_circle", false);
       }
 
     }
   }
 
   //Validation for duplicate entry.
   ValidatepRate() {
     const rateDescription = this.softwareForm.value;
     var dataChanged = false;
     if (this.highlightedRows.length > 0) {
       if (this.highlightedRows[0].software === rateDescription.software &&
         this.highlightedRows[0].active === rateDescription.active) {
         dataChanged = true;
       }
       else {
         dataChanged = false;
       }
     }
     else {
       if (this.recordIdToUpdate == null && ((rateDescription.software != "" && rateDescription.software != null) || !rateDescription.active)) {
         dataChanged = false;
       }
       else{
        dataChanged = true;
       }
     }
 
     return dataChanged;
   }
 
   // To highlight selected row in the grid.
   async selectRow(row: any) {
     if (!this.ValidatepRate()) {
       if (this.recordIdToUpdate != row.id) {
         if (await this.checkDataChange()) {
           this.loadSoftwareToEdit(row);
         }
       }
     }
     else {
       this.loadSoftwareToEdit(row);
     }
   }
 
   async checkDataChange() {
     let rateDescription = this.softwareForm.value;
     if (this.recordIdToUpdate != null) {
       const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
       if (userresponse === "ok") {
         return true;
       }
     }
     else {
       if (this.recordIdToUpdate == null && ((rateDescription.software != "" && rateDescription.software != null) || rateDescription.active === false)) {
         const userresponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
         if (userresponse === "ok") {
           return true;
         }
       }
       else {
         return true;
       }
     }
   }
   //Populate data into form on click of row in grid.
   loadSoftwareToEdit(row) {
     this.isInUse = false;
     if (row.isinuse === 'Y') {
       this.isInUse = true;
     } else { if (row.isinuse === 'N') { this.softwareForm.controls['active'].enable(); } }
 
     this.currentRowIndex = this.dataSource.data.indexOf(row);
     this.highlightedRows.pop();
     this.highlightedRows.push(row);
     this.recordIdToUpdate = row.id;
     this.softwareForm.controls['software'].setValue(row.software);
     this.softwareForm.controls['active'].setValue(row.active);
     this.setFocus();
     this.setSaveBtnEnable();
   }
 
   //Add new Rate Description.
   createSoftware(soft: Software) {
     this.softwareService.createSoftware(soft).subscribe(res => {
       this.saveData();
     },
       (error) => {
         this.software.nativeElement.focus();
         this.errorService.handleError(error);
       });
   }
 
   async saveData() {
     await this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Software", "check_circle", false);
     this.fromSave = true;
     this.loadallSofware();
     this.ResetChanges();
   }
 
   //Update existed data.
   async updateSoftware(soft: Software) {
      soft.id = this.recordIdToUpdate;
       this.softwareService.updateSoftware(soft).subscribe(res => {
       this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Software", "check_circle", false);
       this.recordIdToUpdate = null;
       this.isDescriptionChanged = false;
       this.loadallSofware();
       this.loadSoftwareToEdit(this.dataSource.data[this.currentRowIndex]);
     },
       (error) => {
         this.software.nativeElement.focus();
         this.errorService.handleError(error);
       });
   }
 
   //Delete Software.
   async deleteSoftware(id: number) {
    if(!this.ValidatepRate()){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {
				this.isChangesExists = false;
				this.ResetChanges();
				this.deleteSelectedSoftware(id);				
			}
		}
		else{
			this.deleteSelectedSoftware(id);	
		}    
   }

   async deleteSelectedSoftware(id:number){
    const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline", false);
     if (userresponse === "ok") {
       this.softwareService.deleteSoftwareById(id).subscribe(result => {
         if (result.message == MessageConstants.RECORDINUSE) {
           this.popupService.openAlertDialog(MessageConstants.Software_RECORDINUSE, "Software", "check_circle");
         }
         else {
           this.deleteData();
         }
       }, (error) => {
         this.errorService.handleError(error);
       });
     }
   }
 
   async deleteData() {
     await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Software", "check_circle", false);
     this.loadallSofware();
     this.ResetChanges();
   }
   // To filter data in the grid.
   public doFilter(filterValue: string) {
     if (filterValue && filterValue.trim() != "" && filterValue != null && filterValue != undefined) {
       this.filterData(filterValue);
       this.ResetChanges();
     }
     else {
       this.searchText = '';
       this.filterData(this.searchText);
     }
   }
 
   filterData(filterValue: string) {
     if (filterValue.indexOf('*') == -1) {
       filterValue += '*';
     }
     this.dataSource.filterPredicate = (data: any, filter: string) => {
       if (this.validateWildCardType(data.software.toLowerCase(), filterValue.toLowerCase())) {
         return data.software;
       }
       return data.software.toLowerCase().indexOf(filter) != -1;
     }
     this.dataSource.filter = filterValue.trim().toLowerCase();
     this.isTableHasData = this.dataSource.filteredData.length > 0 ? true : false;
   }
 
   //Validates the wild card search. 
   validateWildCardType(str, rule) {
     var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
     return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
   }
   omit_special_char(event) {
     let inputData = event.srcElement.value;
     let maxAllow = 0;
     if (inputData != undefined && inputData != '') {
       if (inputData[inputData.length - 1] == event.key && event.key == '*') {
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
 
 
   // reset form.
   async resetForm() {
     if (!this.ValidatepRate()) {
       if (await this.checkDataChange()) {
         this.ResetChanges();
         this.searchText = '';
         this.filterData(this.searchText);
       }
     }
     else {
       this.ResetChanges();
       this.searchText = '';
       this.filterData(this.searchText);
     }
   }
 
   //To clear form data.
   ResetChanges() {
     this.softwareForm.reset();
     this.recordIdToUpdate = null;
     this.highlightedRows.pop();
     this.isChangesExists = false;
     this.isInUse = false;
     this.isDescriptionChanged = false;
     this.softwareForm.controls['active'].setValue(true);
     this.currentRowIndex = -1;
     this.setFocus();
     this.setSaveBtnEnable();
   }
 
   public hasError = (controlName: string, errorName: string) => {
     return this.softwareForm.controls[controlName].hasError(errorName);
   }

   //Dirty flag validation on page leave.
    @HostListener('window:onhashchange')
    canDeactivate(): Observable<boolean> | boolean {
    return this.ValidatepRate();
  }
}
