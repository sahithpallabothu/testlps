
export class MessageConstants {
    public static readonly SAVEMESSAGE = "Record saved successfully.";
    public static readonly UPDATECONFIRMMESSAGE = "Are you sure you want to update this record?";
    public static readonly UPDATEMESSAGE = "Record updated successfully.";
    public static readonly DELETECONFIRMMESSAGE = "Are you sure you want to delete this record?";
    public static readonly DELETEMESSAGE = "Record deleted successfully.";
    public static readonly NODATAFOUNDMESSAGE = "No data found";
    public static readonly ALREADYEXISTSMESSAGE = "Record already exists.";
    public static readonly NOCHANGESMESSAGE = "No changes to save.";
    public static readonly RESETMESSAGE = "You are about to reset your changes without saving.\n Are you sure you want to reset anyway? ";
    public static readonly NUMERICREGEX = /^[0-9]{1,4}$/;
    public static readonly LEADINGSPACEMESSAGE = "Leading/Trailing spaces not allowed.";
    public static readonly RECORDINUSE = "RECORD_IN_USE";
    public static readonly CONFIRMDELETERECORDINUSE = "Record is in use. \n Are you sure you want to delete the corresponding records?";
    
    public static readonly  User_RECORDINUSE= "This User has been assigned to one or more roles - Delete not allowed.";
    public static readonly  PERFPATTERN_RECORDINUSE= "This Perforation Pattern has been assigned to one or more applications - Delete not allowed.";
    public static readonly  FLAG_RECORDINUSE= "This Flag has been assigned to one or more applications - Delete not allowed.";
    public static readonly  APPTYPE_RECORDINUSE= "This App Type has been assigned to one or more applications - Delete not allowed.";
    public static readonly  DEPARTMENT_RECORDINUSE= "This Department has been assigned to one or more users - Delete not allowed.";
    public static readonly  STATE_RECORDINUSE= "This State has been used in one or more applications/customers - Delete not allowed.";
    public static readonly  PCARDTATES_RECORDINUSE= "This Postcard Postage Rate has been assigned to one or more applications - Delete not allowed.";
    public static readonly  RUNTYPEORDER_RECORDINUSE= "This Statement Run Type Order has been assigned to one or more applications - Delete not allowed.";
    public static readonly  GROUPS_RECORDINUSE= "This Group has been assigned to one or more applications - Delete not allowed.";
    public static readonly  SHIPMENTMETHOD_RECORDINUSE= "This Shipment Method has been assigned to one or more customers - Delete not allowed.";
    public static readonly  FEEDESCRIPTION_RECORDINUSE= "This Fee Description has been used in one or more jobs - Delete not allowed.";
    public static readonly  Roles_RECORDINUSE= "This Role has been assigned to one or more users - Delete not allowed.";
	public static readonly  NONBILLABLERATE_RECORDINUSE= "This Non Billable Rate has been assigned to one or more applications - Delete not allowed.";
	public static readonly  RateDescription_RECORDINUSE= "This Rate Type has been assigned to one or more Service Agreements - Delete not allowed.";
	public static readonly  Size_RECORDINUSE= "This Size has been assigned to one or more applications - Delete not allowed.";
	public static readonly  DIALOGCLOSE= "You are about to Close without saving.\n Are you sure you want to Close anyway?";
    public static readonly  Contact_RECORDINUSE= "This Contact has been assigned to one or more customer - Delete not allowed.";
    public static readonly BACKMESSAGE = "You are about to go back without saving your changes.\n Are you sure you want to go back anyway? ";
    public static readonly UNAASIGNROLECONFIRMATION = "Are you sure you want to unassign this role?";
    public static readonly ADMINNAME = "Admin";
    public static readonly DATEVALIDATIONMESSAGE = "Please select start date and end date.";
    public static readonly SERVICE_AGREEMENT_MIN_CHARGE_CHANGE_MESSAGE = "You are about to change Minimum Charge. \n Are you sure you want to change anyway?";
    public static readonly SPINNERTEXT = "Loading - please wait...";

    public static readonly ENDDATE_GREATER = "End Date must be greater than Start Date."
    public static readonly DATEFORMAT = "MM/dd/yy";
    public static readonly REQIREDMESSAGEFORENDDATE = "End Date is required."
    public static readonly INVALIDDATEMESSAGE = "Please enter valid date."
    public static readonly INVALID_DATA = "Invalid data in the following row(s):";
    public static readonly ADD_CUSTOMER = "Please enter required fields.";
    public static readonly  ADMINNOTEXIST= "You are about to go logout without adding admin user.\n Are you sure you want to logout? ";
    public static readonly FULLPRIVILEGE = "RIUD";
    public static readonly SUPERADMINLOGIN = "SuperAdminLogin";
    public static readonly  Software_RECORDINUSE= "This Software has been assigned to one or more applications - Delete not allowed.";
    public static readonly  MAX_LIMIT_EXCEEED = "MAXLIMITEXCEEED";
    public static readonly  PAGERESETMESSAGE= "You are about to navigate away from this screen without saving your changes. Are you sure you want to navigate anyway?";
}
