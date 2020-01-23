import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import {FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common'
import { PopupMessageService } from '../../../shared/popup-message.service';
import { SpaceValidator } from '@/shared/spaceValidator';
import { MessageConstants } from '@/shared/message-constants';
@Component({
  selector: 'app-comments-dialog',
  templateUrl: './comments-dialog.component.html',
  styleUrls: ['./comments-dialog.component.css']
})

export class CommentsDialogComponent implements OnInit {
  commentsForm: FormGroup;
  title: string;
  description: string;
  icon: string;
  maxchargeId : number;
  SpaceMessage: string = MessageConstants.LEADINGSPACEMESSAGE;
  constructor(private fb: FormBuilder,
    public datepipe: DatePipe,
    private popupService: PopupMessageService,
    private dialogRef: MatDialogRef<CommentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.title = data.title;
    this.maxchargeId = data.maxchargeId;
  }

  ngOnInit() {
    this.commentsForm = this.fb.group({
      commentsInCommentsDialog: ['', [SpaceValidator.ValidateSpaces]]
    })
  }

  async dialogCancel() {
    if (this.commentsForm.controls["commentsInCommentsDialog"].value !== "") {
      const resetConfirmation = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
			if (resetConfirmation === "ok") {
        this.dialogRef.close("");
			}
    }
    else{
      this.dialogRef.close("");
    }
    
  }

  addComments() {
    
    if (this.commentsForm.controls["commentsInCommentsDialog"].value == "") {
      this.popupService.openAlertDialog("Comment is required.", "Comments", "check_circle", false);
    }
    else {

      let userdata = JSON.parse(sessionStorage.getItem('currentUser'));
      var tempComments = {
        "commentsId":this.maxchargeId+1,
        "jobComments": this.commentsForm.controls["commentsInCommentsDialog"].value,
        "commentsDate": this.datepipe.transform(new Date(), MessageConstants.DATEFORMAT).toString(),
        "userName": userdata['firstName'] + " " + userdata['lastName'],
      }
      this.dialogRef.close(tempComments);
    }

  }
  
  public hasError = (controlName: string, errorName: string) => {
    return this.commentsForm.controls[controlName].hasError(errorName);

  }
}
