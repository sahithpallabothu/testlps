export class Constants {
  
   // public static get HOST_URL(): string { return "http://CS_JAYP/LPS_WebAPI"; };
   public static get HOST_URL(): string { return "http://192.168.70.122:4000"; };
   // public static get HOST_URL(): string { return "http://192.168.70.57/AristaLPS_Server"; };
   // public static get HOST_URL(): string { return "http://216.45.140.171/LPSAristaAPI"; };
   // public static get HOST_URL(): string { return "http://192.168.70.141/AristaLPS_Server";};
   // public static get HOST_URL(): string { return "http://PRUTHVI/LPS_API"; };
   // public static get HOST_URL(): string { return "http://192.168.74.171/LPSAristaAPI"; };
   // public static get HOST_URL(): string { return "http://192.168.70.157/ARISTA_SERSSO"; };


   public static SSO : boolean = false;
   public static ServerIp:string="http://CS_JAYP";
   
   //#region SideNav Menus Constants -----[START]-----
   //Screen Names(main menus)  constants
   public static homeScreenName : string = "Home";
   public static postageScreenName : string = "File Counts";
   public static fileAdjustmentScreenName : string = "File Adjustment";
   public static insertsScreenName : string = "Inserts";
   public static runningSummaryScreenName : string = "Running Summary";
   public static reportsScreenName : string = "Reports";
   public static customerScreenName : string = "Customer";
   public static applicationScreenName : string = "Application";
   public static changePrintLocationScreenName : string = "Change Print Location";
   public static adminScreenName : string = "Admin Screens";
   public static editCustomerScreenName : string = "Edit Customer (Full Access)";
  
   public static additionalChargesScreenName : string = "Additional Charges";
   
  //Sub menus names constants
 //submenus for Insert Screen 
 public static AddAddlChargesSubmenu : string = "Add Additional Charges";
 public static ViewEditAddlChargesSubmenu : string = "View / Edit Additional Charges";


   //submenus for Customer Screen
   public static AddCustomerSubmenu : string = "Add Customer";
   public static ViewEditCustomerSubmenu : string = "View / Edit Customer";

   //submenus for Application Screen
   public static AddApplicationSubmenu : string = "Add Application";
   public static ViewEditApplicationSubmenu : string = "View / Edit Application";

   //submenus for Insert Screen 
   public static AddInsertSubmenu : string = "Add Inserts";
   public static ViewEditInsertSubmenu : string = "View /Edit Inserts";

   //submenus for Admin Screen
   public static appTypeSubmenu : string = "App Type";
   public static departmentSubmenu : string = "Department";
   public static feeDescriptionSubmenu : string = "Fee Description";
   public static flagSubmenu : string = "Flag";
   public static groupsSubmenu : string = "Groups";
   public static postcardPostageRatesSubmenu : string = "Postcard Postage Rates";
   public static perforationPatternsSubmenu : string = "Perforation Patterns";
   public static statementPostageOrderSubmenu : string = "Statement Postage Order";
   public static firstClassPostageRatesSubmenu : string = "First Class Postage Rates";
   // public static rateDescriptionSubmenu : string = "Rate Description";
   public static rateDescriptionSubmenu : string = "Rate Type";
   public static rolesSubmenu : string = "Roles";
   public static statementRunTypeOrderSubmenu : string = "Statement Run Type Order";
   public static shipmentMethodSubmenu : string = "Shipment Method";
   public static sizeSubmenu : string = "Size";
   public static statesSubmenu : string = "States";
   public static usersSubmenu : string = "Users";
   public static softwaresunmenu : string = "Software";
   public static PostageRatesSubmenu : string = "Postage Rates";
//#endregion SideNav Menus Constants -----[END]-----
//id
public static FromMenusInsertsNavFlag:number=3;
public static customerNavFlag:number=6;
public static printLocationFlag:number=8;
public static FromApplicationNavFlag=7;

}
