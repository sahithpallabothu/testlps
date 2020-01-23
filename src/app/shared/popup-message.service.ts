import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Observable} from 'rxjs/Rx'; 
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
import {MatDialog, MatDialogConfig} from "@angular/material";
import { AlertDialogComponent } from '../commoncomponents/alert-dialog/alert-dialog.component';
import { ConfirmDialogComponent } from '../commoncomponents/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PopupMessageService {

	public errorMessage: string = "";
	public confirmDialogResponse : string = "Uninitialized";
			 	 
	constructor(private router: Router, private dialog: MatDialog) { }
	
	// for alertDialog
	public openAlertDialog(strMessage :string, strTitle :string, strIcon:string, alignLeft: boolean = true,
						   stroptionalData?:string, isOptionalMessageExist?:boolean, 
						   OptionalMessageText?:string ): Promise<String>
	{
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;

		// dialogConfig.data = {
		// 	id: 1,
		// 	Icon: strIcon,
		// 	title: strTitle,
		// 	description: strMessage,
		// };

		dialogConfig.data = {
			id: 1,
			Icon: strIcon,
			title: strTitle,
			description: strMessage,
			optionalData: stroptionalData,
			isOptionalMessageExist: isOptionalMessageExist,
			optionalMessageText: OptionalMessageText,
			alignLeft : alignLeft
		};

	  //this.dialog.open(AlertDialogComponent, dialogConfig);
		const dialogRef = this.dialog.open(AlertDialogComponent, dialogConfig);
		return dialogRef.afterClosed().toPromise();	
		// return dialogRef.afterClosed().toPromise();					
	}

	// for ConfirmDialog
	public openConfirmDialog(strMessage :string,icon:string,alignLeft:boolean = true) : Promise<String>  {

		const dialogConfig = new MatDialogConfig();
		this.confirmDialogResponse = "Uninitialized";
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
	  // dialogConfig.height = "200px";
		dialogConfig.data = {
			id: 1,
			title: "Confirm",
			description: strMessage,
			icon:icon,
			alignLeft : alignLeft
		};

	  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
		return dialogRef.afterClosed().toPromise();					
	} 

	public openOkAlertDialog(strMessage :string,strTitle :string,strIcon:string,alignLeft: boolean = true) : Promise<String>
	{
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;

		dialogConfig.data = {
			id: 1,
			Icon: strIcon,
			title: strTitle,
			description: strMessage,
			alignLeft : alignLeft
		};

	  //this.dialog.open(AlertDialogComponent, dialogConfig);
		const dialogRef = this.dialog.open(AlertDialogComponent, dialogConfig);

		return dialogRef.afterClosed().toPromise();	
	}
}
