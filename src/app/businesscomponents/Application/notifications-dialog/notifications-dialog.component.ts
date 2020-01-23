import { Component, OnInit ,ViewChild,ElementRef, Inject,Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig,  MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
//import { contact } from '@/businessclasses/customer/customer';
import { MatSort, MatTableDataSource, MatPaginator, MatRadioButton,MatRadioGroup,ErrorStateMatcher} from '@angular/material';
import { Notification,ApplicationNotifications } from '@/businessclasses/Application/notification';
import { Observable, empty } from 'rxjs';  
import { PopupMessageService } from '../../../shared/popup-message.service';
import { MessageConstants } from '@/shared/message-constants';
import { ApplicationService } from '../../../businessservices/application/application.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { Constants } from '@/app.constants';
import { UserPrivilegesService } from '@/_services';

@Component({
  selector: 'app-notifications-dialog',
  templateUrl: './notifications-dialog.component.html',
  styleUrls: ['./notifications-dialog.component.css']
})

export class NotificationsDialogComponent implements OnInit {

	   ChangeColor=0;
	form: FormGroup;
	title : string;
    custName:string;
	custCode:string;
	appName:string;
	appCode:string;
	appID: number;
	custID: number;	
	selectedNotification : any;
	
	allNotifications: Observable<Notification[]>;
	allUnchangedNotifications: Observable<Notification[]>;
	notificationCheckBox:boolean = true;
	notificationList: any;
	selectedNotificationsData=[];
	openAsView=false;
	//for telephone mask
	telephonemask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;

	//privileges for application screen.
	hasScreenReadPriviledge: boolean = false;
	hasScreenUpdatePriviledge: boolean = false;
	hasScreenInsertPriviledge: boolean = false;
	hasCustomerReadPrivilege:boolean=false;
	isAllowSave: boolean = false;
	
    constructor(
        private fb: FormBuilder,
		private dialog: MatDialog,
		private applicationservice:ApplicationService, 
		private errorService: ErrorHandlerService,
		private popupService: PopupMessageService,
		private userPrivilegesService: UserPrivilegesService,
        public NotificationsDialogRef: MatDialogRef<NotificationsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data
	) 	{
			
			this.selectedNotification = data.notification;
			this.title = data.Strtitle;
			this.custID = data.clientID;
			this.custName = data.customerName;
			this.custCode = data.customerCode;
			this.appID = data.appID;
			this.appName = data.appName;
			this.appCode = data.appCode;
			this.openAsView=false;// data.openAsView;
			this.getNotifications();
				//Set Application screen privileges
				if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.applicationScreenName)) {
					this.hasScreenUpdatePriviledge = true;
				}
				if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.applicationScreenName)) {
					this.hasScreenInsertPriviledge = true;
				}
				if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.applicationScreenName)) {
					this.hasScreenReadPriviledge = true;
				}
	
				if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.customerScreenName)) {
					this.hasCustomerReadPrivilege = true;
				}
		}

    ngOnInit() {
        this.form = this.fb.group({
            // description: [this.description, []],
			title: [this.title, []],
			// icon: [this.icon, []],
            contactname : [{value:'',disabled:true}],
            contacttitle : [{value:'',disabled:true}],
            email :[{value:'',disabled:true}],
            directphone:[{value:'',disabled:true}],
            extension:[{value:'',disabled:true}],
            cellphone:[{value:'',disabled:true}],
            homephone:[{value:'',disabled:true}],
            pdfisready:[''],
            filehasbeenreceived:[''],
            jobhascompleted:[''],
            emailrmt:[''],
            emailcode1:[''],
            customername:[{value:'',disabled:true}],
            customercode:[{value:'',disabled:true}],
            applicationname:[{value:'',disabled:true}],
            applicationcode:[{value:'',disabled:true}]
		});
		
		this.form.controls['customername'].setValue(this.custName);
		this.form.controls['customercode'].setValue(this.custCode);
		this.form.controls['applicationname'].setValue(this.appName);
		this.form.controls['applicationcode'].setValue(this.appCode);
		
		if(this.selectedNotification){				
			this.setSelectedItem(this.selectedNotification);		
		}	

		this.setSaveBtnEnable();
	
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

	
	   //To open from other screen, Enable Or Disable Form Controls.
		EnableOrDisableFormControls(isEnable: Boolean = true) {
			for (var control in this.form.controls) {
				if(control!="contactname" &&control!="contacttitle" 
				&&control!="email" &&control!="directphone"
				&&control!="extension" &&control!="cellphone" 
				&&control!="homephone" &&control!="customername" 
				&&control!="customercode" &&control!="applicationname" && control!="applicationcode")
				isEnable ? this.form.controls[control].enable() : this.form.controls[control].disable();
			}
		}
	 
	
	//get Notifications list
	unchangedNotificationsList=[];
	async getNotifications()
	{
		// load contacts and their corresponding notifications
		this.allNotifications = await this.applicationservice.getAllNotifications(this.custID,this.appID ); 	   
		this.allNotifications.subscribe(results => {
			if (!results) { return };
			this.notificationList = results;
		},
		(error) => {
			this.errorService.handleError(error);
		});

		//for dirty flag validation
		this.allUnchangedNotifications = await this.applicationservice.getAllNotifications(this.custID,this.appID ); 	   
		this.allUnchangedNotifications.subscribe(results => {
			if (!results) { return };
			this.unchangedNotificationsList = results;
		},
		(error) => {
			this.errorService.handleError(error);
		});
	
	}

	//This method works when any notifications checkbox is clicked
	notifyPDF: boolean;
	notifyFileReceived: boolean;
	notifyJobComplete: boolean;
	emailRMT : boolean;
	emailCode1 : boolean;
	applicationCheckBoxOnChange(event) {
		
		this.notifyPDF = this.form.get('pdfisready').value ? true : false;
		this.notifyFileReceived = this.form.get('filehasbeenreceived').value ? true : false;
		this.notifyJobComplete = this.form.get('jobhascompleted').value ? true : false;
		this.emailRMT = this.form.get('emailrmt').value ? true : false;
		this.emailCode1 = this.form.get('emailcode1').value ? true : false;
		for (let i = 0; i < this.notificationList.length; i++) {
			if (this.notificationList[i].contactID === this.currentSelectedContactID) {
				this.notificationList[i].notifyPDF = this.notifyPDF;
				this.notificationList[i].notifyFileReceived = this.notifyFileReceived;
				this.notificationList[i].emailRMT = this.emailRMT;
				this.notificationList[i].emailCode1 = this.emailCode1;
				this.notificationList[i].notifyJobComplete = this.notifyJobComplete;
			}
		}
	}

	//set Selected contact details

	currentSelectedContactID:any;
	currentSelectedEmail:any;
	//:boolean;
	setSelectedItem(contactData:any){

		this.notificationCheckBox = false;
		this.currentSelectedContactID = contactData.contactID;
		this.currentSelectedEmail = contactData.contactEmail;
		this.form.controls['contactname'].setValue(contactData.contactFirstName+" "+ contactData.contactLastName); 
		this.form.controls['contacttitle'].setValue(contactData.contactTitle); 
		this.form.controls['email'].setValue(contactData.contactEmail); 
		this.form.controls['directphone'].setValue(contactData.contactPhone);
		this.form.controls['extension'].setValue(contactData.contactExtension); 				
		this.form.controls['cellphone'].setValue(contactData.contactCell); 
		this.form.controls['homephone'].setValue(contactData.contactHome); 
		
		this.ChangeColor=contactData.contactID;				
		
		contactData.notifyPDF ? this.form.controls['pdfisready'].setValue(1) : this.form.controls['pdfisready'].setValue(0);
		contactData.emailCode1 ? this.form.controls['emailcode1'].setValue(1) : this.form.controls['emailcode1'].setValue(0);
		contactData.notifyJobComplete ? this.form.controls['jobhascompleted'].setValue(1): 	this.form.controls['jobhascompleted'].setValue(0);
		contactData.notifyFileReceived ? this.form.controls['filehasbeenreceived'].setValue(1) : this.form.controls['filehasbeenreceived'].setValue(0);
		contactData.emailRMT ? 	this.form.controls['emailrmt'].setValue(1) : this.form.controls['emailrmt'].setValue(0);
	
	}	
	
	saveSelectedNotifications(){
		let selectedContactIDs="";
		let currentAppID;
		this.selectedNotificationsData=[];
		if(this.changesExistOrNot()){
			for (let i = 0; i < this.notificationList.length; i++) {
				
				if(this.notificationList[i].notifyPDF || this.notificationList[i].notifyFileReceived || this.notificationList[i].emailRMT
					|| this.notificationList[i].emailCode1 ||  this.notificationList[i].notifyJobComplete)
				{	

					let tempObj = {
						ContactID:this.notificationList[i].contactID,
						EmailAddr:this.notificationList[i].contactEmail,
						ApplicationID:this.notificationList[i].applicationID,
						NotifyPDF:this.notificationList[i].notifyPDF,
						NotifyFileReceived:this.notificationList[i].notifyFileReceived,
						EmailRMT:this.notificationList[i].emailRMT,
						EmailCode1:this.notificationList[i].emailCode1,
						NotifyJobComplete: this.notificationList[i].notifyJobComplete
					};
			
					this.selectedNotificationsData.push(tempObj);
				}
			}
			this.updateNotifications();
		}else{
			this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Notifications", "check_circle",false)
		}
	}


	// Update Notification details.
	async updateNotifications() { //, contactIDs
		//	contactIDs = contactIDs.replace(/,\s*$/, "");
		let currentObj = {
			//ContactIDs: contactIDs,
			ApplicationID: this.appID,
			NotificationList: this.selectedNotificationsData
		};

		this.applicationservice.updateNotifications(currentObj).subscribe(() => {
			const userresponse2 = this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Notifications", "check_circle",false);
			this.getNotifications();
		},
		(error) => {
			this.errorService.handleError(error);
		});

	}
  

    async dialogClose() {

		if(this.changesExistOrNot()){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if(response === "ok"){
				this.NotificationsDialogRef.close("cancel");
			}
		}else{
			this.NotificationsDialogRef.close("cancel");
		}
       
    }

	//close Notification Form
    dialogOK() {
        this.NotificationsDialogRef.close("ok");
	}
	

	//check changes exist or not in form
	changesExistOrNot(){

		let flag = false;
		for (let i=0;i< this.unchangedNotificationsList.length;i++){
			for (let j=0;j< this.notificationList.length;j++){
		
				if(this.notificationList[j].contactID === this.unchangedNotificationsList[i].contactID){
					if(this.notificationList[j].notifyPDF !== this.unchangedNotificationsList[i].notifyPDF || this.notificationList[j].notifyFileReceived !== this.unchangedNotificationsList[i].notifyFileReceived ||
						this.notificationList[j].emailRMT !== this.unchangedNotificationsList[i].emailRMT || this.notificationList[j].emailCode1 !== this.unchangedNotificationsList[i].emailCode1 || 
						this.notificationList[j].notifyJobComplete !== this.unchangedNotificationsList[i].notifyJobComplete)
				   {
					   flag = true;
					   break;
				   }
				}
			}
			if(flag === true){
				break;
			}
		}
		
		return flag;
	}
	
	//reset Details In Notification Form
	async resetDetailsInForm(){	
		
		if(this.changesExistOrNot()){
			const response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if(response === "ok"){
				this.clearFormData();
			}
		}
		
	}

	clearFormData(){
		this.getNotifications();
		this.form.controls['contactname'].setValue(''); 
		this.form.controls['email'].setValue(''); 
		this.form.controls['directphone'].setValue(''); 
		this.form.controls['cellphone'].setValue(''); 
		this.form.controls['extension'].setValue(''); 
		this.form.controls['homephone'].setValue('');
		this.form.controls['contacttitle'].setValue('');
		
		this.form.controls['pdfisready'].setValue(0);  
		this.form.controls['emailrmt'].setValue(0);  
		this.form.controls['emailcode1'].setValue(0);  
		this.form.controls['filehasbeenreceived'].setValue(0);  
		this.form.controls['jobhascompleted'].setValue(0);  
		this.ChangeColor=0;
	}
}
