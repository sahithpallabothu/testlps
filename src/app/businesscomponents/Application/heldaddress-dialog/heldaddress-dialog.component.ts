import { Component, OnInit ,ViewChild,ElementRef, Inject,Output,EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig,  MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { FormControl, FormBuilder, FormGroup,FormGroupDirective, NgForm, Validators } from '@angular/forms'; 
import { Injectable } from '@angular/core';
import {MatSort, MatTableDataSource, MatPaginator, MatRadioButton,MatRadioGroup,ErrorStateMatcher} from '@angular/material';
//import { HeldAddress } from '../../../businessclasses/Customer/held-address';  

@Component({
  selector: 'app-heldaddress-dialog',
  templateUrl: './heldaddress-dialog.component.html',
  styleUrls: ['./heldaddress-dialog.component.css']
})
export class HeldaddressDialogComponent implements OnInit {
	tableColumns  :  string[] = ['contactname','address1','address2','city','state','zipcode','shipmentmethod'];
	dataSource1 = new MatTableDataSource<any>();  //'sno',
	title:string;
	custName:string;
	custCode:string;
	isTableHasData=true;
	highlightedRows = [];
	@Output() exampleOutput = new EventEmitter<any[]>();
  @ViewChild(MatSort) sort: MatSort;
 
	 constructor( private fb: FormBuilder,
			private dialogRef: MatDialogRef<HeldaddressDialogComponent>,
			@Inject(MAT_DIALOG_DATA) data) { 
				this.title = data.Strtitle;
				this.custName = data.custName;
				this.custCode = data.custCode;
			
			}

	  ngOnInit() {
					// this.dataSource1.data  = [
					 // { "address1": "55 Primrose Street","address2": "55 Primrose Street", "city": "Merrillville", "state": "IN","zipcode": "46410", "shipmentmethod": "USPS"},
					 // {"address1": "547 Nut Swamp St.","address2": "547 Nut Swamp St.", "city": "Parkersburg", "state": "WV","zipcode": "26101", "shipmentmethod": "Fedex"},
					 // { "address1": "471 Fieldstone Drive","address2": "1 Hilldale", "city": "Dalton", "state": "GA","zipcode": "30721", "shipmentmethod": "UPS"},
					 // { "address1": "Groover-Stewart Building, 45 N Market Street","address2": " Fieldstone Drive-Suite 228", "city": "Winston-Salem", "state": "NC","zipcode": "27127", "shipmentmethod": "Priority"},
					 // { "address1": "8396 Augusta St.","address2": "8396 Augusta St.", "city": "ShelbyVille", "state": "TN","zipcode": "37160", "shipmentmethod": "USPS"}
					// ];
					this.dataSource1.data  = [			
					{	
						contactname:'Bruce Wayne',
						address1:'Newyork',
						address2:'Habersham ',
						city:'Northlake',
						state:'GA',
						shipmentmethod:'USPS',
						zipcode:'30084'
					},
					{	

						contactname:'Steve Rogers',
						address1:'Florida',
						address2:'Sham FL',
						city:'Florida',
						state:'GA',
						shipmentmethod:'Fedex',
						zipcode:'30084'
					},
					{	
						contactname:'Tony Stark',
						address1:'Hawaii',
						address2:'Haber MN ',
						city:'Hawaii',
						state:'MN',
						shipmentmethod:'UPS',
						zipcode:'30084'
					},
					{	

						contactname:'Zampa',
						address1:'Missouri',
						address2:'Sham MN ',
						city:'Missouri',
						state:'MN',
						shipmentmethod:'Priority',
						zipcode:'30084'
					},
					 {
	
						contactname:'Warner',						
						address1:'Tampa',
						address2:'Tampa MN ',
						city:'Tampa',
						state:'MN',
						shipmentmethod:'USPS',
						zipcode:'30084'
					},
				];

					this.dataSource1.sort = this.sort;
			
				   if(this.dataSource1.data.length > 0){
					this.isTableHasData = true;
					} 
					else {
						this.isTableHasData = false;
					}
					
					

			}
  
   dialogCancel() {
        this.dialogRef.close("cancel");
    }
 
	collectData(row) {
		this.dialogRef.close("cancel");
	//	this.exampleOutput.emit(row);
    }

    dialogOK() {
        this.dialogRef.close("ok");
    }

  selectRow(row) {

		  this.highlightedRows.pop();
		  this.highlightedRows.push(row);
		}
	
}



