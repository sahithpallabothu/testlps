export class Job {
	recordID : number;
	inputName : string;
	outputName : string;
	processed: string;
	runDate: string;
	billDate: string;
	postedDate: string;
	accounts :number;
	jobsPrint :string;
}

 export class HomeSearch{
	selectedClientId?: number;
	selectedStartDate?  : Date;
	selectedEndDate? : Date;
	telephone? : string = "";
	fax?: string = "";
	ivrPhoneNumber?: string = "";
	mailerId?:  number = 0;
	crid?:  number = 0;
	comments?: string = "" ;
	selectedCustName?  : string = "" ;
	selctedcustCode? : string ="" ; 
	selectedAppName?: string = "";
	selectedAppCode?: string = "";
	ebpp?: boolean = false;
	pdf? : boolean = false;
	ivr? : boolean = false;
	dm? : boolean = false;
} 
