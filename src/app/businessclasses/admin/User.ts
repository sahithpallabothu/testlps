import { Role } from './Role';

export class User {
    userId: number;
    userName: string;
    firstName: string;
    lastName: string;
    isActive:boolean;
    departmentId ?: number = 0;
    departmentName ?: string ='';
    locationID ?:number = 0;
    description : string;    
    token?: string;
    userRoles : Role[] ;
    emailAddress : string;
    extension? : string  ='';
    cellPhone : string;
    initials? : string  ='';
    isUserExists ?: boolean;
    locationDescription ? :string;
    roleName? :string;
}

export class Location{
    locationId : number;
    code : string;
    description : string;
    active : boolean;
}