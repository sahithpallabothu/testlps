export class AdditionalChargesInfo {
    userName: string;
	additionalCharges: AdditionalCharges[];
}

export class AdditionalCharges{
        id : number;
        amount:number;
		jobName : string;
		description : string;
		chargeType : number;
		feeDesc: string;
		runDate : string;
		jobDetailRunDate : string;
		jobRecordId : number;
}

export class GetAdditionalCharges{
	jobName : string;
	customerCode : string;
	customerName: string;
	clientCode:string;
	clientName:string;
	jobRecordID : number;
	acRecordID : number;
	runDate : string;
	feeID : number;
	feeDesc : string;
	comments : string;
	enteredUser : string;
	dateEntered : string;
	amount: number;
} 