import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ContactDialogComponent } from '../businesscomponents/Customer/contact-dialog/contact-dialog.component';

/*
import { HeldaddressDialogComponent } from '../businesscomponents/Application/heldaddress-dialog/heldaddress-dialog.component';
import { NotificationsDialogComponent } from '../businesscomponents/Application/notifications-dialog/notifications-dialog.component'; */
import { OuncesDialogComponent } from '../businesscomponents/Postage/ounces-dialog/ounces-dialog.component';
import { ChargesDialogComponent } from '../businesscomponents/Postage/charges-dialog/charges-dialog.component';
import { CommentsDialogComponent } from '../businesscomponents/Postage/comments-dialog/comments-dialog.component';
import { ServiceAgreementDialogComponent } from '../businesscomponents/Customer/service-agreement-dialog/service-agreement-dialog.component';
/* import { typeOfCharges, Comments} from '../businessclasses/Postage/postage';

import { AddcustomerComponent } from '../businesscomponents/Customer/addcustomer/addcustomer.component'; */
@Injectable({
    providedIn: 'root'
})

export class PopupDialogService {
    constructor(private router: Router, private dialog: MatDialog) { }

   /*  //Held Address
    public OpenHeldAddressDialog(title: string, custName: string, custCode: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data =
            {
                Strtitle: title,
                custName: custName,
                custCode: custCode
            }
        const dialogRef = this.dialog.open(HeldaddressDialogComponent, dialogConfig);
    }
 */
    /* // Notifications
    public OpenNotificationDialog(title: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data =
            {
                Strtitle: title
            }
        const dialogRef = this.dialog.open(NotificationsDialogComponent, dialogConfig);
    } */

    // Ounces Dialog
    public OpenOuncesDialog(strTitle: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "33%";
        //dialogConfig.height = "79.8%";
        dialogConfig.data =
            {
                title: strTitle
            };

        const dialogRef = this.dialog.open(OuncesDialogComponent, dialogConfig);
    } 

    // Additional Charges Dialog
    public OpenAdditionalChargesDialog(strTitle: string, typeCharge: any) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        //dialogConfig.height = "50%";

        dialogConfig.data =
            {
                title: strTitle,
                temp: typeCharge
            };

        const dialogRef = this.dialog.open(ChargesDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(value => {
            return 'sent';
        });
    }

    // Add Comments Dialog
    public OpenAddCommentsDialog(strTitle: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.height = "42%";
        dialogConfig.width = "40%";

        dialogConfig.data =
            {
                title: strTitle
            };

        const dialogRef = this.dialog.open(CommentsDialogComponent, dialogConfig);
    }

    // Contacts Dialog
   public OpenContactssDialog(strTitle: string,custName:string,custTelephone:string,custID:number,custCode:string,custFromHome:boolean) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxWidth =  "90vw";
        dialogConfig.data =
            {
                title: strTitle,
                customerName:custName,
                customerCode : custCode,
                customerID: custID,
                customerTelephone : custTelephone,
               // addContactDialog: addContactdialog,
                customerFromHome: true,
                customerReadPrivilege:false,
				customerUpdatePrivilege:false, 

            };

        const dialogRef = this.dialog.open(ContactDialogComponent, dialogConfig);
    }

   // Service Agreement Dialog
   public OpenServiceAgreementDialog(strTitle: string, customerID: number, btndisable: boolean) {
    const servicedialog = new MatDialogConfig();
    servicedialog.disableClose = true;
    servicedialog.autoFocus = true;

    servicedialog.width = "1500px";
    servicedialog.data =
        {
            title: strTitle,
            customerId: customerID,
            btndisable: false,
        };
    const servicedialogConfig = this.dialog.open(ServiceAgreementDialogComponent, servicedialog);
}

    /*  //Supplementary Service Agreement Dialog
    public OpenSupplementaryServiceAgreementDialog(strTitle: string, customerName: string, customerCode: string, btndisable: boolean) {
        const servicedialog = new MatDialogConfig();
        servicedialog.disableClose = true;
        servicedialog.autoFocus = true;

        servicedialog.width = "1500px";
        servicedialog.data =
            {
                title: strTitle,
                customerName: customerName,
                customerCode: customerCode,
                btndisable: false,
            };
        const servicedialogConfig = this.dialog.open(SupplementaryServiceAgreementComponent, servicedialog);
    } */

  /*   //Open  CustomerDialog 
    public OpenCustomerDialog(strTitle: string, customerID: number, addCustomerDialog: boolean) {
        
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.height = "600px";
        dialogConfig.data = {
            title: strTitle,
            custCode: customerID,
            addCustomerDialog: true,
        };
        const dialogRef = this.dialog.open(AddcustomerComponent, dialogConfig);
    }
    //Open  Application Dialog 
    public OpenApplicationDialog(strTitle: string, customerID: number, addCustomerDialog: boolean) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.height = "710px";
        dialogConfig.data = {
            custCode: "CC5003",
            title: "Application",
            editApplicationDialogShow: true,
        };
        const dialogRef = this.dialog.open(AddapplicationComponent, dialogConfig);

    } */

}
