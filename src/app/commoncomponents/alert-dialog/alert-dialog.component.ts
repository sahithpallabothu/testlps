
//https://blog.angular-university.io/angular-material-dialog/



import { Component, OnInit , Inject } from '@angular/core';
import { MatDialog, MatDialogConfig,  MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit {

    form: FormGroup;
	icon : string;
	title : string;
    description:string;
    OptionalData:string;
    isOptionalMessageExist:boolean=false;
    textBoxState:boolean=false;
    messageText:string='Show ';
    messageFromOtherScreen:string;
    alignLeft : boolean;
     constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data) {
		this.icon = data.Icon;
		this.title = data.title;
        this.description = data.description;
        this.OptionalData=data.optionalData;
        this.alignLeft = data.alignLeft;
        if(this.OptionalData!=null && this.OptionalData.length>0){
            this.OptionalData=this.OptionalData.replace(/,/g, '\n');
        }
        if(data.isOptionalMessageExist)
        {
            this.isOptionalMessageExist=data.isOptionalMessageExist;
            this.messageText+=data.optionalMessageText;
            this.messageFromOtherScreen=data.optionalMessageText;
        }
    }

    ngOnInit() {
        this.form = this.fb.group({
            description: [this.description, []],
			title: [this.title, []],
            icon: [this.icon, []],
            OptionalData:[this.OptionalData,[]]
        });
    }

    save() {
        this.dialogRef.close(this.form.value);
    }

    close() {
        this.dialogRef.close();
    }
    // Toggles the text name when clicked.
    toggleTextBox(){
      this.messageText='';
      this.textBoxState=!this.textBoxState;
      this.messageText=this.textBoxState?'Hide '+ this.messageFromOtherScreen:'Show '+ this.messageFromOtherScreen;
    }
}

    
