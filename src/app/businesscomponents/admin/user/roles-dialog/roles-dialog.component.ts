// Angular components.
import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, ElementRef, TemplateRef ,Inject} from '@angular/core';
import { MatSort, MatTableDataSource,  ErrorStateMatcher } from '@angular/material';

// Business classes.
import { User,Location } from '@/businessclasses/admin/User';
import { Role } from '@/businessclasses/admin/Role';

import { MatDialog, MatDialogConfig,  MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-roles-dialog',
  templateUrl: './roles-dialog.component.html',
  styleUrls: ['./roles-dialog.component.css']
})
export class RolesDialogComponent implements OnInit {
   
    roletabledisplayedColumns: string[] = ['roleName', 'selected'];
    dataSource = new MatTableDataSource<User>();
    rolesdataSource = new MatTableDataSource<Role>();
    title : string;
    roleDataFromUser : any;
    isRoleChangesExists :boolean = false;
    checkedRoleList  :Role[]= [];
    ngOnInit() {

      this.loadUnassignedRoles();
    }
    constructor(
      private dialogRef: MatDialogRef<RolesDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) 
     {
        this.title = data.title;
        this.roleDataFromUser = data.unAssignedRolesFromUser;
     }

    //close dialog
    roleDialogCancel() {
     this.isRoleChangesExists = false;
     this.roleDataFromUser.forEach(item=>{
       if(item.selected)
       {
         item.selected = false;
       }
     }); 
     this.rolesdataSource.data = this.roleDataFromUser;
     this.dialogRef.close("close");
    }

    //populate unassigned role data to datasource.
    loadUnassignedRoles(){
      if(this.roleDataFromUser.length > 0){
       // this.roleDataSourcedata = this.roleDataFromUser
       this.roleDataFromUser.sort((a, b) => (a.roleName.toLocaleLowerCase() > b.roleName.toLocaleLowerCase()) ? 1 : ((b.roleName.toLocaleLowerCase() > a.roleName.toLocaleLowerCase()) ? -1 : 0));
       this.rolesdataSource.data = this.roleDataFromUser ;
      }
    }

    isRoleChange(event, role) {
      this.rolesdataSource.data.forEach(item => {
        if (role.roleId == item.roleId) {
          this.isRoleChangesExists = true;
          if (event.source.checked) {
            item.selected = event.source.checked;
            this.checkedRoleList.push(item);
          }
          else {
            let index: number = this.checkedRoleList.findIndex(d => d.roleId === item.roleId);
            this.checkedRoleList.splice(index, 1);
            item.selected = false;
          }
        }
      });
    }
  
    addUnAssignedRoles(){
      var rolesObj : any = {
				"unAssignedRolesFromUser" : this.checkedRoleList,
			}
        this.dialogRef.close(rolesObj);
    }
}