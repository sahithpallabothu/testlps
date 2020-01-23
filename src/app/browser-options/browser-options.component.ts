import { Component, OnInit, Inject } from '@angular/core';
import {  MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import{Constants } from '@/app.constants'
@Component({
  selector: 'app-browser-options',
  templateUrl: './browser-options.component.html',
  styleUrls: ['./browser-options.component.css']
})
export class BrowserOptionsComponent implements OnInit {

  title:string;
  serverIp:string=Constants.ServerIp;
  settingsVisible:boolean=false;
  constructor(private dialogRef: MatDialogRef<BrowserOptionsComponent>,
		@Inject(MAT_DIALOG_DATA) data) { 
      this.title=data.title;
    }

  ngOnInit() {
  }

  async dialogCancel() {
    this.dialogRef.close("cancel");
  }
  toggleFirefoxSettings(){
    this.settingsVisible=this.settingsVisible?false:true;
    
  }

}
