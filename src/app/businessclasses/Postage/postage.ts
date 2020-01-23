export class Postage {
	recordID ?: number;
	jobName: string;
	customerName ? : string;
	customerCode : string;
	applicationName ? : string;
	applicationCode ? : string;
	runDate ? : Date;
	billDate ? : string;
	postDate ? : string;
	postedDate? : string;
	postFlag : boolean ;
	processedFlag : boolean ;
	printed : boolean;
	uspsTripCode ? : string;

	accountsDetail: number;
	accountsInvoice: number;
	pagesDetail : number;
	pagesInvoice : number;
	overflowDetail : number;
	overflowInvoice : number;
	suppressed : number;

	digit5 : number;
	aadc : number;
	mixedAADC : number;
	pressorted : number;
	singlePieces : number;
	
	meterPieces : number;
	held : number;
	foreign : number;
	outOfBalance : number;
	meterAmount : number;


	oz1 : number;
	oz2 : number;
	oz3 : number;
	oz4 : number;
	oz5	 : number;
	oz6 : number;
	oz7 : number;
	oz8 : number;
	oz9 : number;
	oz10 : number;
	oz11 : number;
	oz12 : number;
	oz13	 : number;
	oz14 : number;
	oz15 : number;
	oz16: number;
	ozPermit2: number;
	ozSingle2: number;

	globalInsert: number;
	selective1 : number;
	selective2 : number;
	selective3 : number;
	selective4 : number;
	selective5 : number;
	insertsTotal : number;

	additionalCharges ?: typeOfCharges[];
	comments ?: Comments[];
	USPSPostageTotal?:number;

	//used for home.
	inputName: string;
	outputName: string;
	upload: Date;
	received: Date; 
	processedDate : Date;
}
export class typeOfCharges {
	
	chargeId:number;
	feeId : number;
	chargeType : string;
	chargeAmount:number;
	description:string;
	chargeDate:string;
	userName : string;
	
}
export class Comments {
	commentsId:number;
	jobComments:string;
	commentsDate:string;
	userName : string;
}
