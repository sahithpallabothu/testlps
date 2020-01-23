import { Component, OnInit ,ViewChild,ElementRef, Inject,Output,EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig,  MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
import {MatSort, MatTableDataSource, MatPaginator, MatRadioButton,MatRadioGroup,ErrorStateMatcher} from '@angular/material';
import { InsertService } from '../../../businessservices/insert/insert.service';
import { Inserts } from '../../../businessclasses/Inserts/Insert';  
import { Observable } from 'rxjs';
import { ErrorHandlerService } from '../../../shared/error-handler.service';

@Component({
  selector: 'app-inserts-print-location-dialog',
  templateUrl: './inserts-print-location-dialog.component.html',
  styleUrls: ['./inserts-print-location-dialog.component.css']
})
export class InsertsPrintLocationDialogComponent implements OnInit {


	
    insertsDataSource = new MatTableDataSource<Inserts>();
	allInserts:Observable<Inserts[]>; //'sno',
	title:string;
	appName:string;
	appCode:string;
	heldReason:string;
	holdCheckBox:boolean;
	inserts2CustomerId:number;
	isTableHasData=true;
	highlightedRows = [];
	insertsdata=[];
	insertsdata1=[];
	insertColumns  :  string[] = ['applicationCode',
								'startDate',
								'endDate',
								'insertType',
								'number',
								'returnInserts',
								'returnedQuantity',
								'usedQuantity',
								'weight',
								'reorderQuantity',
								'receivedQuantity',
								'receivedDate',
								'receivedBy',
								'binLocation',
								'description',
								'active',	
								'locationInserts',
								
								];
	@Output() exampleOutput = new EventEmitter<any[]>();
  @ViewChild(MatSort) sort: MatSort;
 
	 constructor( private fb: FormBuilder,
			private insertservice:InsertService, 
			private errorService: ErrorHandlerService,
			private dialogRef: MatDialogRef<InsertsPrintLocationDialogComponent>,
			@Inject(MAT_DIALOG_DATA) data) { 
				this.title = data.Strtitle;
				this.appName = data.appName;
				this.appCode = data.appCode;
				this.inserts2CustomerId = data.inserts2CustomerId;
				this.holdCheckBox = data.holdCheck=="Y" ? true : false;
				this.heldReason = data.heldReason;
			}

	  	ngOnInit() {	
			if(this.inserts2CustomerId!==0){
				this.loadInsertList(this.inserts2CustomerId);
			}else{
				this.isTableHasData = false;
			}
		}
		//remove time stamp from datetime
		getDateOnly(pDate){
			var postedDate ="";
			if(pDate == null || pDate == ""){
				postedDate = pDate
			}
			else{
				pDate = new Date(pDate);
				let month = pDate.getMonth() + 1 < 10 ? "0" + (pDate.getMonth() + 1) : pDate.getMonth() + 1;
				let day = pDate.getDate() < 10 ? "0" + pDate.getDate() : pDate.getDate();
				postedDate = month + "/" + day + "/" + String(pDate.getFullYear()).substring(2); //+pDate.getHours()+":"+pDate.getMinutes()+":"+pDate.getSeconds();
			}
			
			return postedDate;
		}
			
		loadInsertList(applicationID){
			this.insertsdata1=[];
			let screenCPLName = 'CHANGEPRINTLOCATION';
			this.allInserts = this.insertservice.getallInsertsByApplicationID(applicationID,'00/00/00','00/00/00',screenCPLName); 	   
			this.allInserts.subscribe(results => {
			if (!results) { return };
			
			this.insertsdata=results;
			this.insertsDataSource = new MatTableDataSource<Inserts>(this.insertsdata);
			this.insertsDataSource.sort = this.sort;
			
			if(this.insertsDataSource.data.length > 0){
				this.isTableHasData = true;
			} 
			else {
					this.isTableHasData = false;
				}
			},
			(error) => {
				this.errorService.handleError(error);
			});
		}
  
   dialogCancel() {
        this.dialogRef.close("cancel");
    }
 
	collectData(row) {
		this.dialogRef.close("cancel");
    }

    dialogOK() {
        this.dialogRef.close("ok");
    }

  selectRow(row) {

		  this.highlightedRows.pop();
		  this.highlightedRows.push(row);
		}
	

}
