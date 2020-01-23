export class Notification {
	ContactID: string;
	ClientID: string;
	ContactFirstName: string;
	ContactLastName: string;
	ContactTitle: string;
	ContactEmail: string;
	ContactPhone: string;
	ContactExtension: string;
	ContactCell: string;
	ContactHome: string;
	BillingContact: string;
	BillingAlternateContact :string;
	OOBContact :string;
	DELQContact: string;
    CCContact: string;
    EBPPContact: string;
    InsertContact:string;
	InsertAlternateContact: string;
	EmailConfirmations: string;
	USPS: string;
	FedExUPSContact: string;
	FedExUPSContactComment: string;
	Comment: string;
	NotifyPDF: string;
	NotifyJobComplete: string;
	NotifyFileReceived: string;
	EmailRMT: string;
	EmailCode1: string;
	AlarmExist: string;
	ApplicationID: string;
}


export class ApplicationNotifications
{
	ContactID :string;
	ApplicationID : string;
	EmailAddr :string;
	NotifyPDF:boolean;
	NotifyJobComplete :boolean;
	NotifyFileReceived :boolean;
	EmailRMT:boolean;
	EmailCode1:boolean;
}

export class NotificationsObject{
	//ContactIDs: string;
	ApplicationID: number;
	NotificationList: ApplicationNotifications[];
}
