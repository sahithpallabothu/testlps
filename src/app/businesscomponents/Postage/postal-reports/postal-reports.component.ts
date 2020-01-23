import {MatSort, MatTableDataSource,MatSelectChange,MatOption ,MatPaginator, MatRadioButton,MatRadioGroup,ErrorStateMatcher, MatSelect} from '@angular/material';
import { Component, OnInit,ViewChild, AfterViewInit, ElementRef  } from '@angular/core';  
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms';  
import { Observable, empty } from 'rxjs';  
import { formControlBinding } from '@angular/forms/src/directives/ng_model';
import { Postage } from '../../../businessclasses/Postage/postage';  
import { forEach } from '@angular/router/src/utils/collection';
import {Router,ActivatedRoute } from '@angular/router';
import { PostageService } from '../../../businessservices/postage/postage.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';
import { PopupDialogService } from '../../../shared/popup-dialog.service';

@Component({
  selector: 'app-postal-reports',
  templateUrl: './postal-reports.component.html',
  styleUrls: ['./postal-reports.component.css']
})
export class PostalReportsComponent implements OnInit {

  constructor(private formbulider: FormBuilder, 
    private postageService:PostageService, 
    private errorService: ErrorHandlerService,
    private popupService: PopupMessageService,
	private popupdlgService : PopupDialogService,
    private route: ActivatedRoute,
    private element: ElementRef) {
          
   }
    postalReportsForm = new FormGroup({
		postalReports_JobName:new FormControl(),
		postalReportsRunMonth:new FormControl(),
		postalReports_SaveReports:new FormControl(),
		reports_2OZDetail:new FormControl(),
		reports_form3600:new FormControl(),
		reports_rrp:new FormControl(),
		reports_workorder:new FormControl(),
		reports_jobControlLog:new FormControl(),
		reports_cass:new FormControl(),
		reports_rmt:new FormControl(),
		reports_tags:new FormControl(),
	});
   public savereports = [
                     {"id": 0, "saveReportTo": "(Select)"}
                    ]
  public saveReportsInPostage = -1;
  public months = [
                     {"id": 0, "month": "(Select)"},
                     {"id": 1, "month": "January"},
                     {"id": 2, "month": "February"},
                     {"id": 3, "month": "March"},
                     {"id": 4, "month": "April"},
                     {"id": 5, "month": "May"},
                     {"id": 6, "month": "June"},
                     {"id": 7, "month": "July"},
                     {"id": 8, "month": "August"},
                     {"id": 9, "month": "September"},
                     {"id": 10, "month": "October"},
                     {"id": 11, "month": "November"},
                     {"id": 12, "month": "December"}
                    ]
  public runMonthInPostage = -1;
  ngOnInit() {
  }
  selectAllCheckBoxes(){
	  this.postalReportsForm.controls['reports_2OZDetail'].setValue(1);
	  this.postalReportsForm.controls['reports_form3600'].setValue(1);
	  this.postalReportsForm.controls['reports_rrp'].setValue(1);
	  this.postalReportsForm.controls['reports_workorder'].setValue(1);
	  this.postalReportsForm.controls['reports_jobControlLog'].setValue(1);
	  this.postalReportsForm.controls['reports_cass'].setValue(1);
	  this.postalReportsForm.controls['reports_rmt'].setValue(1);
	  this.postalReportsForm.controls['reports_tags'].setValue(1);
  }
  clearAllCheckBoxes(){
	  this.postalReportsForm.controls['reports_2OZDetail'].setValue(0);
	  this.postalReportsForm.controls['reports_form3600'].setValue(0);
	  this.postalReportsForm.controls['reports_rrp'].setValue(0);
	  this.postalReportsForm.controls['reports_workorder'].setValue(0);
	  this.postalReportsForm.controls['reports_jobControlLog'].setValue(0);
	  this.postalReportsForm.controls['reports_cass'].setValue(0);
	  this.postalReportsForm.controls['reports_rmt'].setValue(0);
	  this.postalReportsForm.controls['reports_tags'].setValue(0);
  }
  resetAll(){
	  this.postalReportsForm.reset();
  }
  onpostalReportsFormFormSubmit(){}
}
