export class ClientServiceAgreement{
    clientID:number;
    startDate?:string;
    endDate?:string; 
    termNoticeDate?:string;
    sla?:number;
    initialTerm?:number;
    renewalTerm?:number;
    sedcmbrno?:string;
    billType?:number;
    minChargeAmt?:number;
    systemNumber?:string;
	PGBillRate?:number;
	CSBillRate?:number;
	NonAutoFeeRate?:number;
	PDFProcessingFee?:number;
    EBPPProcessingRate?:number;
   clientType?:boolean;
}

export class BillingRatesInfo{
    clientID:number;
    billingRates : BillingRate[];
}

export class Contracts{
    clientContractID:number;
    clientID:number;
    contractDate:string;
    contractType:number;
    contractTypeDesc:string;
    contract:string; 
}

export class BillingRate{
    applicationID:number;
    clientID:number;
    applicationName:string;
    applicationCode:string;   
    appID:string;   
	statementName:string;
	consolidationAcc:string;
    isActive:boolean;
    printOrder:string;
    customerRateDetails : CustomerRate[];
}

export class CustomerRate{
    customerRateID:number;
    customerID:number;
    appID:string;
    rateTypeID:number;
    rate:number;
    description:string;
}

// Dropdown values.
export class ContractType{
    contractTypeID:number;
    description:string;
    active:boolean;
}

export class RateType{
    rateTypeID:number;
    description:string;
    active:boolean;
}