import { Component, OnInit,EventEmitter, Output,Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import {BrowserOptionsComponent} from '@/browser-options/browser-options.component';
import { AuthenticationService } from '@/_services';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(private dialog: MatDialog,
    private dialogRef: MatDialogRef<FooterComponent>,
		@Inject(MAT_DIALOG_DATA) data,
    private authenticationService: AuthenticationService) { }
  @Output() valueChange = new EventEmitter();
  isUserLoggedin:boolean=true;
  ngOnInit() {
    
  this.checkUserLoggedIn();
  }

  OpenInstructions(){

    const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
     // dialogConfig.height = "300px";
		//	dialogConfig.width = "640px";
			dialogConfig.data = {
				title: "Browser Options",
			};
			const dialogRef = this.dialog.open(BrowserOptionsComponent, dialogConfig);
  }

   //Output Emitter function for footer hide when user logged in
   checkUserLoggedIn(){

    const currentUser = this.authenticationService.currentUserValue;
    // console.log(currentUser);
    if (currentUser) {			
      this.valueChange.emit(true);
    }
}



}
