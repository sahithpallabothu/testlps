
export class contact {

    contactID:number;
    clientID:number;
    contactFirstName:string;
    contactLastName :string;
    contactTitle :string; 
    contactEmail :string;
    contactPhone :string;
    contactExtension :string;
    contactCell :string;
    contactHome:string;
    billingContact:boolean;
    billingAlternateContact:boolean;
    oOBContact:boolean;
    dELQContact:boolean;
    cCContact:boolean;
    eBPPContact:boolean;
    insertContact:boolean;
    insertAlternateContact:boolean;
    emailConfirmations:boolean;
    comment:string;
    applicationList : CustomerApplications[];
    message?:string; // For getting the updated contact ID;
}

export class CustomerApplications
{   
    applicationID:number;
    customerName :string;
    customerCode :string; 
    alarmExist:boolean;

    emailCode1: boolean;
    emailRMT: boolean;
    notifyFileReceived: boolean;
    notifyJobComplete: boolean;
    notifyPDF: boolean;
}

export class Notifications
{
    applicationId: number;
    emailCode1: boolean;
    emailRMT: boolean;
    notifyFileReceived: boolean;
    notifyJobComplete: boolean;
    notifyPDF: boolean;
}
