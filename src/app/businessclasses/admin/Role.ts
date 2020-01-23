export class Role {
    roleId?: number;
    roleName: string;   
    roleDescriprion?:string;
    roleActive?:boolean;
    Privileges:privileges[];
    selected?:boolean;
    ISINUSE ?:string;
}

export class privileges
{
    roleId?: number;
    screenName:string;
    rolePrivilegeId:number;
    privilege: string;
    read:boolean;
    insert:boolean;
    update:boolean;
    delete:boolean;
    iDisable:boolean;
    rDisable:boolean;
    uDisable:boolean;
    dDisable:boolean;
}

