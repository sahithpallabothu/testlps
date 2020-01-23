export class Application {
	clientID:number; /*customer ID*/
	stid:string;/*combination of imbTracing & Endorsement*/
	abpp:boolean;
	applicationID : number;
	customerName  : string;
	customerCode  : string;
	applicationName  : string;
	applicationCode  : string;
	processingHold : boolean;
	customerState  : string;
	customerFlag  : string;
    customerID:number;/*It is Field with placeholder ID*/
    appType  : string;
	color  : string;
	customerNumber  : string; //Getting from db.
    heldAddressState  : string;
    heldAddress1  : string;
    heldAddress2  : string;
	heldCity  : string;
	heldZipCode : string;
	contactName:string
	shipmentMethod:string
	heldAddressOther1:string;
	heldAddressOther2:string;
	heldCityOther:string;
	heldAddressStateOther:string;
	heldZipCodeOther:string;
	heldContactNameOther:string;
	heldShipmentMethodOther:string;
	
	mailingAddress1: string;
	mailingAddress2: string;
	mailingState: string;
	mailingZipCode: string;
	mailngCity: string;
	
    physicalAddress1:string;
    physicalAddress2:string;
    physicalCity:string;
    physicalState:string;
    physicalZipCode:string;

	holdReason  : string;
	active:boolean;
	autoRun:boolean;
	ebpp:boolean;
	imbTracing:boolean;
	pdf:boolean;
	overlay:boolean;
	backer:boolean;
	duplex:boolean;/*Field not in DB*/
	software  : string;
	printLocation:string;
	runFrequency  : number;
	runFrequencyName:string;
	endorsement:string;/*Field not in DB*/
	paper:string;
	perf  : number;
	perfPatternDescription:string;
	size  : number;
	printSide  : number;
	outsideEnvelope  : string;
	returnEnvelope  : string;
	ancillaryBill:boolean;
	detailBill:boolean;
	invoiceBill:boolean;
	itemizedBill:boolean;
	multimeterBill:boolean;
	municipalBill:boolean;
	summaryBill:boolean;
	mdm:boolean;
	tdhud:boolean;
	tva:boolean;
	unBundled:boolean;
	check:boolean;
	delinquent:boolean;
	thirdParty:boolean;
	dm:boolean;

	checkHeld1TypeId?:number=0;
	held2TypeId?:number=0;
	clientActive?:boolean=true;
}

export class ChargeType{
		id : number;
		chargeType : string;
}
