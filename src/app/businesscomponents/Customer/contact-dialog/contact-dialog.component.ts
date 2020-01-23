
//angular components.
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource, ErrorStateMatcher } from '@angular/material';
import { Observable } from 'rxjs';

// Business components.
import { contact, CustomerApplications, Notifications } from '../../../businessclasses/customer/contact';
import { ContactService } from '../../../businessservices/customer/contact.service';
import { UserPrivilegesService } from '@/_services';

// Popup messages. 
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';

//Constants
import { SpaceValidator } from '@/shared/spaceValidator';
import { TrimMask } from '@/shared/trimMask';
import { MessageConstants } from '@/shared/message-constants';
import { Constants } from '@/app.constants';
import { ErrorMatcher } from '@/shared/errorMatcher';

@Component({
	selector: 'app-contact-dialog',
	templateUrl: './contact-dialog.component.html',
	styleUrls: ['./contact-dialog.component.css']
})
export class ContactDialogComponent implements OnInit {
	contactForm: FormGroup;
	tableColumns: string[] = ['contactFirstName', 'contactLastName', 'contactTitle'];
	Contact_DATA: any;
	ContactList: Observable<contact[]>;
	ContactID: any;
	dataSource = new MatTableDataSource<contact>();	
	isTableHasData = true;// search no data found.
	highlightedRows = [];
	contactArray: any = [];
	allContacts: any = [];
	rowsCount: any;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('firstauto') private firstName: ElementRef;	
	@ViewChild('cForm') myForm;// Used for reset form.
	//for telephone mask.
	telephonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	//Dialog variables.
	title: string;
	description: string;
	icon: string;
	isContactUpdate: boolean = false;
	currentContactRowID: Number = -1;
	dataFromCust: boolean = false;
	isDisabledContactDialogButton: boolean = false;
	custName: string;
	custCode: string;
	custTelephone:string;
	custId: number;
	updateContactId: number = -1;
	EditContactData:contact[];
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
	//Notifications related object.
	ApplicationtList: Observable<CustomerApplications[]>;
	DirtyFlagApplicationtList: Observable<CustomerApplications[]>;
	Applicationarray: CustomerApplications[];
	ApplicationNotifications = [];
	dirtyFlagNotifications=[];
	ContactNotifications=[];
	notifyPDF: boolean;
	notifyFileReceived: boolean;
	notifyJobComplete: boolean;
	emailRMT: boolean;
	emailCode1: boolean;
	presentAppId: number = -1;
	disableflag = true;
	ChangeColor = 0;
	hasPrivilegeToAddAndUpdateContact:boolean=false;
	// Validation check box message variable.
	billingCheckboxMessage = "";
	InsertCheckboxMessage = "";
	isContactCreated:boolean=false;
	isChangesExists: boolean = false;//No changes variable.
	initPageLoad:boolean=true;
	errorMatcher = new ErrorMatcher();

	//Screen privilege variables
	hasScreenReadPriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	hasScreenDeletePriviledge: boolean = false;
	isAllowSave: boolean = false;
	fromHome: boolean = false;
	isEditCustomer :boolean = false;

	constructor(private fb: FormBuilder,
		private contactService: ContactService,
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
		private dialogRef: MatDialogRef<ContactDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data) {
		this.title = data.title;
		this.icon = data.icon;
		this.custName = data.customerName;
		this.custCode = data.customerCode;
		this.description = data.description;
		data.customerTelephone=data.customerTelephone==null?'':data.customerTelephone==undefined?'':data.customerTelephone;
		this.custTelephone=""+data.customerTelephone;
		this.custTelephone=this.custTelephone.replace('(','').replace(')','').replace('-','').replace(' ','');
		if(this.custTelephone!=''){
			this.custTelephone="("+this.custTelephone.substr(0,3)+")"+" "+this.custTelephone.substr(3,3)+"-"+this.custTelephone.substr(6);
		}		
		this.custId = data.customerID;
		this.dataFromCust = data.customerFromHome;
		this.fromHome = data.customerFromHome;

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
		  if (this.hasScreenDeletePriviledge && this.hasScreenUpdatePriviledge) {
			this.tableColumns = ['contactFirstName', 'contactLastName', 'contactTitle','delete'];
		  }
	}

	ngOnInit() {	
		this.contactForm = this.fb.group({
			contactFirstName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			contactLastName: ['', [Validators.required, SpaceValidator.ValidateSpaces]],
			contactTitle: ['', [SpaceValidator.ValidateSpaces]],
			contactEmail: ['', [Validators.required, Validators.pattern(/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/), SpaceValidator.ValidateSpaces]],
			contactCell: ['',[this.validateTelephone]],
			contactPhone: ['',[this.validateTelephone]],
			contactExtension: ['', [Validators.pattern(/^[0-9]*$/), SpaceValidator.ValidateSpaces]],//[Validators.required]],
			contactHome: ['',[this.validateTelephone]],
			comment: ['', [SpaceValidator.ValidateSpaces]],
			billingContact: [''],
			billingAlternateContact: [''],
			oOBContact: [''],
			dELQContact: [''],
			cCContact: [''],
			eBPPContact: [''],
			insertContact: [''],
			insertAlternateContact: [''],
			emailConfirmations: [''],
			notifyPDF: [''],
			notifyFileReceived: [''],
			notifyJobComplete: [''],
			emailRMT: [''],
			emailCode1: ['']
		});

		this.loadApplications(this.custId, -1);
		this.loadContacts(this.custId);
		this.getAllContacts();
		this.setSaveBtnEnable()

		//To sort based on table header.
		this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
			if (typeof data[sortHeaderId] === 'string') {
				return data[sortHeaderId].toLocaleLowerCase();
			}
			return data[sortHeaderId];
		};		
		this.setFocusForFirstName();
	}

	// Used to set the focus for the first name.
	 setFocusForFirstName(){
		setTimeout(()=>{ // this will make the execution after the above boolean has changed
			this.firstName.nativeElement.setSelectionRange(this.firstName.nativeElement.value.length , this.firstName.nativeElement.value.length );
			this.firstName.nativeElement.focus();
		  },0);  
	 }

	 //To set Save button enable based on privilage. 
	 setSaveBtnEnable() {		
		if (this.hasScreenUpdatePriviledge) {
		  this.isAllowSave = true;
		} else {
		  this.isAllowSave = false;
		}
		this.disableControlsFromHome( this.isAllowSave);
	  }

    // To close the contact dialog.
	async dialogCancel() {
		//if(!this.dataFromCust){
		if (this.isChangesExists) {
			if(this.updateContactId!=-1 && this.checkDataChanged(this.buildContactForm())){
				const response = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
				if (response === "ok") {
					this.dialogRef.close(this.isContactCreated);
				}
			}
			else if(this.isChangesExists && this.updateContactId==-1 && this.checkDirtyFlag()){
				const response = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
				if (response === "ok") {
					this.dialogRef.close(this.isContactCreated);
				}
			}	
			else {
				this.dialogRef.close(this.isContactCreated);
			}
		}
		else{
			this.dialogRef.close(this.isContactCreated);
		}
	}

	// when an input value is changed.
	isChange() {
		this.isChangesExists = true;
	}

	//Validate Alternate and normal check box for primary and Insert.
	ValidateCheckBoxAlternate(): boolean {
		let isbothChecked = false;
		this.billingCheckboxMessage = "";
		this.InsertCheckboxMessage = "";
		let billingContact = this.contactForm.get('billingContact').value ? true : false;
		let billingAlternateContact = this.contactForm.get('billingAlternateContact').value ? true : false;
		let insertContact = this.contactForm.get('insertContact').value ? true : false;
		let insertAlternateContact = this.contactForm.get('insertAlternateContact').value ? true : false;
		if (billingContact && billingAlternateContact) {
			isbothChecked = true;
			this.billingCheckboxMessage = "Primary & Primary Alternate Contact both cannot be checked.\r\n";
		}
		if (insertContact && insertAlternateContact) {
			isbothChecked = true;
			this.InsertCheckboxMessage = "Insert & Insert Alternate Contact both cannot be checked.";
		}
		return isbothChecked;
	}

	// Validate new name and existing name.
    validateNameOfTheContact(): boolean {        
		let newName = this.contactForm.get('contactFirstName').value + "" + this.contactForm.get('contactLastName').value;
		let isNameExist = false;
		for (let i = 0; i < this.allContacts.length; i++) {
			let oldName = this.allContacts[i].contactFirstName + "" + this.allContacts[i].contactLastName;
			if (this.updateContactId != this.allContacts[i].contactID) {
				if (newName.toLowerCase().trim() === oldName.toLowerCase().trim()) {
					isNameExist = true;
					break;
				}
			}
		}
		return isNameExist;
	}

	// To get all the available contacts from the database.
	getAllContacts() {
		this.ContactList = this.contactService.getContacts(this.custId);  //Default '0' is passing to get all contacts
		this.ContactList.subscribe(results => {
			if (!results) { return };
			this.allContacts = results;
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}

	//To get the contacts data form.
	buildContactForm():any{
		const contactFormData = this.contactForm.value;
		contactFormData.billingContact = (contactFormData.billingContact === null || contactFormData.billingContact === "") ? false : contactFormData.billingContact;
		contactFormData.billingAlternateContact = (contactFormData.billingAlternateContact === null || contactFormData.billingAlternateContact === "") ? false : contactFormData.billingAlternateContact;
		contactFormData.oOBContact = (contactFormData.oOBContact === null || contactFormData.oOBContact === "") ? false : contactFormData.oOBContact;
		contactFormData.dELQContact = (contactFormData.dELQContact === null || contactFormData.dELQContact === "") ? false : contactFormData.dELQContact;
		contactFormData.cCContact = (contactFormData.cCContact === null || contactFormData.cCContact === "") ? false : contactFormData.cCContact;
		contactFormData.eBPPContact = (contactFormData.eBPPContact === null || contactFormData.eBPPContact === "") ? false : contactFormData.eBPPContact;
		contactFormData.insertContact = (contactFormData.insertContact === null || contactFormData.insertContact === "") ? false : contactFormData.insertContact;
		contactFormData.insertAlternateContact = (contactFormData.insertAlternateContact === null || contactFormData.insertAlternateContact === "") ? false : contactFormData.insertAlternateContact;
		contactFormData.emailConfirmations = (contactFormData.emailConfirmations === null || contactFormData.emailConfirmations === "") ? false : contactFormData.emailConfirmations;
		contactFormData.contactCell=TrimMask.trimMask(contactFormData.contactCell);
		contactFormData.contactPhone=TrimMask.trimMask(contactFormData.contactPhone);
		contactFormData.contactHome=TrimMask.trimMask(contactFormData.contactHome);
		this.ContactNotifications=[];
		for(var i=0;i<this.ApplicationNotifications.length;i++){
			if(this.ApplicationNotifications[i].emailCode1 || this.ApplicationNotifications[i].emailRMT || this.ApplicationNotifications[i].notifyFileReceived || this.ApplicationNotifications[i].notifyJobComplete || this.ApplicationNotifications[i].notifyPDF){
				this.ContactNotifications.push(this.ApplicationNotifications[i]);
			}
		}
		contactFormData.applicationList = this.ContactNotifications;
		contactFormData.clientID = this.custId;
		return contactFormData;
	}

	// when form data is submitted.
 	 onFormSubmit() {
		const contactFormData = this.buildContactForm();	
		if (!this.ValidateCheckBoxAlternate()) { // to validate whether the billing and billing Alternate contact are checked.
			if (this.isChangesExists) {
				// Validates whether the contact name present or not in db.
				if (!this.validateNameOfTheContact()) {
					if (this.updateContactId == -1) {
						this.createContact(contactFormData);
					}
					else if (this.updateContactId != -1) {						
						if(this.checkDataChanged(contactFormData) && this.hasScreenUpdatePriviledge){
							contactFormData.contactID = this.updateContactId;
							this.updateContact(contactFormData);
						}
						else{
							this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Contacts", "check_circle",false)
						}						
					}
				}
				else {
					this.popupService.openAlertDialog(MessageConstants.ALREADYEXISTSMESSAGE, "Contacts", "check_circle",false);
				}
			}
			else {
				this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Contacts", "check_circle",false)
			}
		}
		else {
			this.popupService.openAlertDialog(this.billingCheckboxMessage + "\n" + this.InsertCheckboxMessage, "Contacts", "check_circle");
		}
	}

	//Validate Telephone.
    validateTelephone(control: FormControl):any{
		let isValidTelephoneNumber=true;
		if(control.value && control.value.indexOf("_")>=0){
			 isValidTelephoneNumber=false;
			 return isValidTelephoneNumber ? null : { 'InvalidTelephone': true };
		}	
		return null;
	}

	//Validates whether data is changed compared to original data.
	 checkDataChanged(FormData):boolean{
		let isDataChanged=false;
		let notificationsChanged=false;
		for (let i = 0; i < this.dirtyFlagNotifications.length; i++) {
			if(this.ApplicationNotifications[i].applicationID==this.dirtyFlagNotifications[i].applicationID){
				if((this.ApplicationNotifications[i].emailCode1==this.dirtyFlagNotifications[i].emailCode1) && (this.ApplicationNotifications[i].notifyPDF==this.dirtyFlagNotifications[i].notifyPDF) && (this.ApplicationNotifications[i].notifyJobComplete==this.dirtyFlagNotifications[i].notifyJobComplete)){
					if((this.ApplicationNotifications[i].notifyFileReceived==this.dirtyFlagNotifications[i].notifyFileReceived) && (this.ApplicationNotifications[i].emailRMT==this.dirtyFlagNotifications[i].emailRMT)){
						notificationsChanged=false;	
					}
					else{
						notificationsChanged=true;
						break;
					}
				}else{
					notificationsChanged=true;
					break;
				}
			}
		} 
		if((this.EditContactData["contactFirstName"]==FormData.contactFirstName) && 
			(this.EditContactData["contactLastName"]==FormData.contactLastName) &&
			 (this.EditContactData["contactTitle"] ==FormData.contactTitle)
			){
			if((this.EditContactData["contactEmail"]==FormData.contactEmail )&& 
				(this.EditContactData["contactPhone"]==FormData.contactPhone) && 
				(this.EditContactData["contactExtension"]==FormData.contactExtension) && 
				(this.EditContactData["contactCell"]==FormData.contactCell) && 
				(this.EditContactData["contactHome"]==FormData.contactHome) && 
				(this.EditContactData["comment"]==FormData.comment)
			){
				if((this.EditContactData["billingContact"]==FormData.billingContact) && 
					(this.EditContactData["billingAlternateContact"]==FormData.billingAlternateContact) &&
					 (this.EditContactData["oobContact"]==FormData.oOBContact) && 
					 (this.EditContactData["delqContact"]==FormData.dELQContact) && 
					 (this.EditContactData["ccContact"]==FormData.cCContact)
				){
					if((this.EditContactData["ebppContact"]==FormData.eBPPContact) && 
						(this.EditContactData["insertContact"]==FormData.insertContact) && 
						(this.EditContactData["insertAlternateContact"]==FormData.insertAlternateContact) && 
						(this.EditContactData["emailConfirmations"]==FormData.emailConfirmations)
					){
						isDataChanged=false;
					}
					else{
						isDataChanged=true;
					}
				}
				else{
					isDataChanged=true;
				}   
			}
			else{
				isDataChanged=true;
			}
		}else{
			isDataChanged=true;
		}
		return (isDataChanged || notificationsChanged);
	}

	//This method works when any notifications checkbox is clicked.
	applicationCheckBoxOnChange(event) {
		this.notifyPDF = this.contactForm.get('notifyPDF').value ? true : false;
		this.notifyFileReceived = this.contactForm.get('notifyFileReceived').value ? true : false;
		this.notifyJobComplete = this.contactForm.get('notifyJobComplete').value ? true : false;
		this.emailRMT = this.contactForm.get('emailRMT').value ? true : false;
		this.emailCode1 = this.contactForm.get('emailCode1').value ? true : false;
		for (let i = 0; i < this.ApplicationNotifications.length; i++) {
			if (this.ApplicationNotifications[i].applicationID === this.presentAppId) {
				this.ApplicationNotifications[i].notifyPDF = this.notifyPDF;
				this.ApplicationNotifications[i].notifyJobComplete = this.notifyJobComplete;
				this.ApplicationNotifications[i].notifyFileReceived = this.notifyFileReceived;
				this.ApplicationNotifications[i].emailRMT = this.emailRMT;
				this.ApplicationNotifications[i].emailCode1 = this.emailCode1;
			}
		}
	}

	// Set the notifications checkbox when clicked on application.
	setSelectedItem(id) {
		//if(!this.dataFromCust && this.hasPrivilegeToAddAndUpdateContact){
		if(!this.dataFromCust && this.isAllowSave){
			this.disableflag = false;
		}		
		this.ChangeColor = id;
		this.presentAppId = id;
	
		for (let i = 0; i < this.ApplicationNotifications.length; i++) {
			if (this.ApplicationNotifications[i].applicationID === this.presentAppId) {
				this.contactForm.controls['notifyPDF'].setValue(this.ApplicationNotifications[i].notifyPDF ? 1 : 0);
				this.contactForm.controls['notifyFileReceived'].setValue(this.ApplicationNotifications[i].notifyFileReceived ? 1 : 0);
				this.contactForm.controls['notifyJobComplete'].setValue(this.ApplicationNotifications[i].notifyJobComplete ? 1 : 0);
				this.contactForm.controls['emailRMT'].setValue(this.ApplicationNotifications[i].emailRMT ? 1 : 0);
				this.contactForm.controls['emailCode1'].setValue(this.ApplicationNotifications[i].emailCode1 ? 1 : 0);
			}
		}
		this.ChangeColor = id;
	}

	//load All Contacts.
	loadContacts(custid) {
		this.ContactList = this.contactService.getContacts(custid);
		this.ContactList.subscribe(results => {
			if (!results) { return };
			this.dataSource.sort = this.sort;
			this.Contact_DATA = results;
			this.dataSource.data = results;
			this.contactArray = results;
			//NOT LOADED PAGE LOAD --LALITHA 
		/* 	if(this.contactArray.length>0 && this.initPageLoad){
				this.editContactByRow(this.contactArray[0]);
			} */
            // This logic will whenever a new contact is inserted or existing contact updated.
			if(this.updateContactId!==-1){
				for(var i=0;i<this.contactArray.length;i++){
					if(this.updateContactId==this.contactArray[i].contactID){
						this.editContactByRow(this.contactArray[i]);
						this.highlightedRows.pop();
						this.highlightedRows.push(this.contactArray[i]);
					}
				}
			}
			this.rowsCount = this.dataSource.data.length;
			if (this.dataSource.data.length > 0) {
				this.isTableHasData = true;
			}
			else {
				this.isTableHasData = false;
			}
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}

	// Load all applications and notifcations.
	async loadApplications(clientId, contactID) {
		this.dirtyFlagNotifications=[];
		this.ApplicationtList =await this.contactService.getApplications(clientId, contactID);
		this.ApplicationtList.subscribe(results => {
			if (!results) { return };
			this.Applicationarray = results;
			this.ApplicationNotifications = results;
			
			if(this.initPageLoad && this.ApplicationNotifications.length>0){
				
				this.setSelectedItem(this.ApplicationNotifications[0].applicationID);
				if(contactID!=-1){
					this.initPageLoad=false;
				}			
			}else{
				if(this.ApplicationNotifications.length>0){
					for(let i=0;i<this.ApplicationNotifications.length;i++){
						if(this.ApplicationNotifications[i].alarmExist){
							this.ChangeColor=this.ApplicationNotifications[i].applicationID;
							this.setSelectedItem(this.ChangeColor);
							break;
						}else{
							this.ChangeColor = this.ApplicationNotifications[0].applicationID;
						}
					}
					
				}	
			}
		},
		(error) => {
			this.errorService.handleError(error);
		});

		this.DirtyFlagApplicationtList =await this.contactService.getApplications(clientId, contactID);
		this.DirtyFlagApplicationtList.subscribe(results => {
			if (!results) { return };
			this.dirtyFlagNotifications =  results;
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}
	
	//select row for highlighted.
	async selectRow(row) {
		if (this.isChangesExists) {
			if(this.updateContactId!=-1 && this.checkDataChanged(this.buildContactForm())){
				const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
				if (response === "ok") {
					this.highlightedRows.pop();
					this.highlightedRows.push(row);
					this.editContactByRow(row);
				}
			}
			else if(this.updateContactId==-1){
					const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
					if (response === "ok") {
						this.highlightedRows.pop();
						this.highlightedRows.push(row);
						this.editContactByRow(row);
					}
				}
			else{
				this.highlightedRows.pop();
				this.highlightedRows.push(row);
				this.editContactByRow(row);
			}
		}
		else {
			this.highlightedRows.pop();
			this.highlightedRows.push(row);
			this.editContactByRow(row);
		}	
	}

	//To edit contact by row.
	async editContactByRow(row: any) {
			
		this.ChangeColor=0;
		this.ContactNotifications=[];
		this.EditContactData = row;
		this.disableflag = true;
		this.isChangesExists = false;
		this.updateContactId = row.contactID;
		this.contactForm.controls['notifyPDF'].setValue(false);
		this.contactForm.controls['notifyFileReceived'].setValue(false);
		this.contactForm.controls['notifyJobComplete'].setValue(false);
		this.contactForm.controls['emailRMT'].setValue(false);
		this.contactForm.controls['emailCode1'].setValue(false);
		this.currentContactRowID = row.id;
		this.isContactUpdate = true;
		this.contactForm.controls['contactFirstName'].setValue(row.contactFirstName?row.contactFirstName.trim():row.contactFirstName);
		this.contactForm.controls['contactLastName'].setValue(row.contactLastName?row.contactLastName.trim():row.contactLastName);
		this.contactForm.controls['contactTitle'].setValue(row.contactTitle?row.contactTitle.trim():row.contactTitle);
		this.contactForm.controls['contactEmail'].setValue(row.contactEmail);
		this.contactForm.controls['contactPhone'].setValue(row.contactPhone);
		this.contactForm.controls['contactExtension'].setValue(row.contactExtension);
		this.contactForm.controls['contactCell'].setValue(row.contactCell);
		this.contactForm.controls['contactHome'].setValue(row.contactHome);
		this.contactForm.controls['comment'].setValue(row.comment?row.comment.trim():row.comment);
		this.contactForm.controls['billingContact'].setValue(row.billingContact);
		this.contactForm.controls['billingAlternateContact'].setValue(row.billingAlternateContact);
		this.contactForm.controls['oOBContact'].setValue(row.oobContact);
		this.contactForm.controls['dELQContact'].setValue(row.delqContact);
		this.contactForm.controls['cCContact'].setValue(row.ccContact);
		this.contactForm.controls['eBPPContact'].setValue(row.ebppContact);
		this.contactForm.controls['insertContact'].setValue(row.insertContact);
		this.contactForm.controls['insertAlternateContact'].setValue(row.insertAlternateContact);
		this.contactForm.controls['emailConfirmations'].setValue(row.emailConfirmations);
		await this.loadApplications(this.custId, row.contactID);
		this.setFocusForFirstName();
	}

	//rowContactForm validation before reset.
	async ClearContacts() {
		if (this.isChangesExists) {		
			if(this.updateContactId!=-1 && this.checkDataChanged(this.buildContactForm())){
				const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
				if (response === "ok") {
					this.editContactByRow(this.EditContactData);
				}
			}
			else if(this.updateContactId==-1 && this.checkDirtyFlag()){
					const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline",true);
					if (response === "ok") {
						this.ResetContactForm();
					}
				}
			else{
				this.ResetContactForm();
			}
		}
		else {
			this.ResetContactForm();
		}
	}

	//check dirty flag validation
/* 	checkDirtyFlag() {
		let Flag = false;
		//let i = 0;
		if (this.contactForm.value.length > 1) {
			Flag = true;
		} else {
			if (this.contactForm.controls['contactFirstName'].value!== "" || this.contactForm.controls['contactLastName'].value!== "" ||
				this.contactForm.controls['contactTitle'].value !== "" || this.contactForm.controls['contactEmail'].value!== "" ||
				this.contactForm.controls['contactExtension'].value !== "" || this.contactForm.controls['contactPhone'].value !== "" ||
				this.contactForm.controls['contactCell'].value!== "" || this.contactForm.controls['contactHome'].value!=="" ||
				this.contactForm.controls['comment'].value!=="") {
				Flag = true;
			}
			if (this.contactForm.controls['billingContact'].value || 
				this.contactForm.controls['billingAlternateContact'].value ||
				this.contactForm.controls['oOBContact'].value||
				 this.contactForm.controls['cCContact'].value||
				this.contactForm.controls['dELQContact'].value || 
				this.contactForm.controls['insertContact'].value||
				this.contactForm.controls['eBPPContact'].value!== "" ||
				 this.contactForm.controls['insertAlternateContact'].value!=="" ||
				this.contactForm.controls['emailConfirmations'].value!=="") {
				Flag = true;
			}
		}
		return Flag;
	} 
	*/


	checkDirtyFlag() {
		let Flag = false;
		if (this.contactForm.value.length > 1) {
			Flag = true;
		} else {
			if (this.contactForm.controls['contactFirstName'].value!== "" || this.contactForm.controls['contactLastName'].value!== "" ||
				this.contactForm.controls['contactTitle'].value !== "" || this.contactForm.controls['contactEmail'].value!== "" ||
				this.contactForm.controls['contactExtension'].value !== "" || this.contactForm.controls['contactPhone'].value !== "" ||
				this.contactForm.controls['contactCell'].value!== "" || this.contactForm.controls['contactHome'].value!=="" ||
				this.contactForm.controls['comment'].value!=="" ||this.contactForm.controls['billingContact'].value!==false||this.contactForm.controls['billingAlternateContact'].value!==false
				||this.contactForm.controls['oOBContact'].value!==false||this.contactForm.controls['dELQContact'].value!==false||this.contactForm.controls['cCContact'].value!==false
				||this.contactForm.controls['eBPPContact'].value!==false||this.contactForm.controls['insertContact'].value!==false||this.contactForm.controls['insertAlternateContact'].value!==false
				||this.contactForm.controls['emailConfirmations'].value!==false) {
				
					for (let i = 0; i < this.ApplicationNotifications.length; i++) {
						if (this.ApplicationNotifications[i].notifyPDF!=false ||  
							
							this.ApplicationNotifications[i].notifyJobComplete!=false ||
							this.ApplicationNotifications[i].notifyFileReceived!=false ||
							this.ApplicationNotifications[i].emailRMT!=false ||
							this.ApplicationNotifications[i].emailCode1!=false ){
								Flag = true;
								return Flag;
						}
						else{
							Flag = false;
						}
					}
					Flag = true;
				
			}
			else{
				for (let i = 0; i < this.ApplicationNotifications.length; i++) {
					if (this.ApplicationNotifications[i].notifyPDF!=false ||  
						
						this.ApplicationNotifications[i].notifyJobComplete!=false ||
						this.ApplicationNotifications[i].notifyFileReceived!=false ||
						this.ApplicationNotifications[i].emailRMT!=false ||
						this.ApplicationNotifications[i].emailCode1!=false ){
						
							Flag = true;
							return Flag;
					}
					else{
						Flag = false;
					}
				}
				Flag = false;
			}
		}
		return Flag;
	}

	//Reset form data.	
	ResetContactForm() {
		this.updateContactId = -1;
		this.EditContactData = [];
		this.ContactNotifications=[];
		this.isContactUpdate = false;
		this.isChangesExists = false;
		this.myForm.resetForm(); //used to reset form 
		this.disableflag = true;
		this.loadApplications(this.custId, -1);
		this.contactForm.controls['contactFirstName'].setValue('');
		this.contactForm.controls['contactLastName'].setValue('');
		this.contactForm.controls['contactTitle'].setValue('');
		this.contactForm.controls['contactEmail'].setValue('');
		this.contactForm.controls['contactPhone'].setValue('');
		this.contactForm.controls['contactExtension'].setValue('');
		this.contactForm.controls['contactCell'].setValue('');
		this.contactForm.controls['contactHome'].setValue('');
		this.contactForm.controls['comment'].setValue('');
		this.contactForm.controls['billingContact'].setValue(false);
		this.contactForm.controls['billingAlternateContact'].setValue(false);
		this.contactForm.controls['oOBContact'].setValue(false);
		this.contactForm.controls['dELQContact'].setValue(false);
		this.contactForm.controls['cCContact'].setValue(false);
		this.contactForm.controls['eBPPContact'].setValue(false);
		this.contactForm.controls['insertContact'].setValue(false);
		this.contactForm.controls['insertAlternateContact'].setValue(false);
		this.contactForm.controls['emailConfirmations'].setValue(false);
		this.contactForm.controls['notifyPDF'].setValue(false);
		this.contactForm.controls['emailRMT'].setValue(false);
		this.contactForm.controls['emailCode1'].setValue(false);
		this.contactForm.controls['notifyFileReceived'].setValue(false);
		this.contactForm.controls['notifyJobComplete'].setValue(false);
		this.highlightedRows.pop();
		this.ChangeColor = 0;
		this.isChangesExists=false;
		this.initPageLoad=false;
		this.setFocusForFirstName();
	}

	//To create Contact.	
	async createContact(contactInfo: contact) {
		this.contactService.createContact(contactInfo).subscribe(res => {
			if(res!=null){
				this.isContactCreated=true;
				this.initPageLoad=false;
				this.updateContactId=parseInt(res.message);
				this.isChangesExists=false;
				this.switchToEditContact();
				this.ResetContactForm();
				this.setFocusForFirstName();
			}	
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}

	//To Update contact details.
	async updateContact(contactInfo: contact) {
		this.contactService.updateContact(contactInfo).subscribe(res => {
			this.updateContactId=parseInt(res.message);
				this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Contacts", "check_circle",false);
			this.isChangesExists=false;
			this.isContactCreated=true;
			this.initPageLoad=false;
			this.loadContacts(this.custId);
			this.getAllContacts();
		},
		(error) => {
			this.errorService.handleError(error);
		});
	}

	//To delete Contact.
	async deleteContact(contactID: number) {
		if(this.checkDataChanged(this.buildContactForm())){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {      
				this.ResetContactForm();
				this.deleteSelectedContact(contactID);				
			}
		}
		else{
			this.deleteSelectedContact(contactID);	
    	}   		 		
	}

	async deleteSelectedContact(contactID){
		const userresponse = await this.popupService.openConfirmDialog(MessageConstants.DELETECONFIRMMESSAGE, "help_outline",false);
		if (userresponse === "ok") {
			this.contactService.deleteContactById(contactID, this.custId, 0).subscribe(res => { //0 means not confirm to last contact deletion
				if (res.message == MessageConstants.RECORDINUSE) {
					this.popupService.openAlertDialog("This Contact has been assigned to a held address for the Customer. Delete not allowed.", "Contacts", "check_circle",false);
				}else if(res.message =="LAST_CONTACT"){
					//this.popupService.openAlertDialog("", "Contacts", "check_circle",false);
					this.confirmToDeleteLastContact(contactID, this.custId);
				}
				else {
					this.deleteData();					
				}
			},
			(error) => {
				this.errorService.handleError(error);
			});
		}
	}
	
	async confirmToDeleteLastContact(contactID, custId){
		const userresponse = await this.popupService.openConfirmDialog("This is the last Contact receiving notifications. Are you sure you want to delete anyway?", "help_outline",false);
		if (userresponse === "ok") {
			this.contactService.deleteContactById(contactID, custId, 1).subscribe(res => { //1 means confirm to last contact deletion
				this.deleteData();					
			},
			(error) => {
				this.errorService.handleError(error);
			});
		} 		
	}
	
	async deleteData(){
		await this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Contacts", "check_circle",false);
		this.loadContacts(this.custId);
		this.isContactCreated=true;
		this.getAllContacts();
		this.ResetContactForm();
	} 

	//Switch to Edit Contact.
	async switchToEditContact(){
	  await this.popupService.openOkAlertDialog(MessageConstants.SAVEMESSAGE, "Contacts", "check_circle",false);
	  await this.loadContacts(this.custId);
	  await this.getAllContacts();

	}
	
	// Disable controls when on home
	disableControlsFromHome(disabelFlag){
		if(!disabelFlag){
			this.contactForm.controls['contactFirstName'].disable();
			this.contactForm.controls['contactLastName'].disable();
			this.contactForm.controls['contactTitle'].disable();
			this.contactForm.controls['contactEmail'].disable();
			this.contactForm.controls['contactPhone'].disable();
			this.contactForm.controls['contactExtension'].disable();
			this.contactForm.controls['contactCell'].disable();
			this.contactForm.controls['contactHome'].disable();
			this.contactForm.controls['comment'].disable();
			this.contactForm.controls['billingContact'].disable();
			this.contactForm.controls['billingAlternateContact'].disable();
			this.contactForm.controls['oOBContact'].disable();
			this.contactForm.controls['dELQContact'].disable();
			this.contactForm.controls['cCContact'].disable();
			this.contactForm.controls['eBPPContact'].disable();
			this.contactForm.controls['insertContact'].disable();
			this.contactForm.controls['insertAlternateContact'].disable();
			this.contactForm.controls['emailConfirmations'].disable();
			this.contactForm.controls['notifyPDF'].disable();
			this.contactForm.controls['emailRMT'].disable();
			this.contactForm.controls['emailCode1'].disable();
			this.contactForm.controls['notifyFileReceived'].disable();
			this.contactForm.controls['notifyJobComplete'].disable();
		}	
	}

	// controls validation  	  
	public hasError = (controlName: string, errorName: string) => {
		return this.contactForm.controls[controlName].hasError(errorName);
	}

	//validate spaces 
	validateSpaces(key) {
		key.srcElement.value = key.srcElement.value.trim();
	  }

	//Space not allowed for email address.
	spaceNotAllowed(event){
		if (event.keyCode === 32 ) {
			return false;
		  }
	}
}

