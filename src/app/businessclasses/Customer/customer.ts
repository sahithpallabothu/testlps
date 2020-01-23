
export class Customer {
    customerId?:number;
    customerName : string;
    customerCode : string;
    active?: boolean;
    sedc? : boolean; 
    ivr?: boolean;
    telephone: string;
    fax?: string;
    ivrPhoneNumber?: string;
    mailerId?: number;
    crid?: number;
    comment?: string;

    mailingAddress1?: string;
    mailingAddress2?: string;
    mailingCity?: string;
	mailingState? : string;
    mailingZip?: string;
    
    physicalAddress1?: string;
    physicalAddress2?: string;
    physicalCity?: string;
	physicalState?: string;
    physicalZip?: string;
   
    checkHeld1TypeId?:number=0;
    checkHeldContact?: number;
    checkHeldAddress1?: string;
    checkHeldAddress2?: string;
    checkHeldCity?:string;
    checkHeldState?:string;
    checkHeldShipmentMethod?:number;
    checkHeldZip?:string;
    
    held2TypeId?:number=0;
    heldContact?: number;
    heldAddress1?: string;
    heldAddress2?: string;
    heldCity?:string;
    heldState?:string;
    heldShipmentMethod?:number;
    heldZip?:string ; 
    isAllowSave?:boolean;

    heldShipment?:string;
    checkShipment?:string;
    heldContactName?:string;
    checkHeldContactName?:string;

    applicationName?:string;
    applicationCode ?:string;
    applicationActive ? : boolean = true;
} 

export class HeldType{
    heldTypeId : number;
    description : string;
} 
