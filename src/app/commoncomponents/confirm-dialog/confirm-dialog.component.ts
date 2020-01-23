
//https://blog.angular-university.io/angular-material-dialog/



import { Component, OnInit , Inject } from '@angular/core';
import { MatDialog, MatDialogConfig,  MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

    form: FormGroup;
	title : string;
    description:string;
    icon:string;
    alignLeft : boolean;
     constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data) {
		this.title = data.title;
		this.icon = data.icon;
        this.description = data.description;
        this.alignLeft = data.alignLeft;
    }

    ngOnInit() {
        this.form = this.fb.group({
            description: [this.description, []],
			title: [this.title, []],
			icon: [this.icon, []],
            
        });

        document.getElementById("descID").innerHTML =this.description;
    }

    dialogCancel() {
        this.dialogRef.close("cancel");
    }

    dialogOK() {
        this.dialogRef.close("ok");
    }
}

    