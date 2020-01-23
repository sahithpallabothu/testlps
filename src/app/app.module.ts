import { BrowserModule } from '@angular/platform-browser';  
import { NgModule } from '@angular/core';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { HttpClientModule,  HTTP_INTERCEPTORS } from '@angular/common/http';  
import {  
  MatButtonModule, MatMenuModule, MatDatepickerModule,MatNativeDateModule , MatIconModule, MatCardModule, MatSidenavModule,MatFormFieldModule,  
  MatInputModule, MatTooltipModule, MatToolbarModule, MatTableModule, MatSortModule,MatPaginatorModule,MatTabsModule,MatListModule,
  MatProgressBarModule, MatProgressSpinnerModule,MatCheckboxModule,MatSelectModule,MatExpansionModule
} from '@angular/material';  

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRadioModule } from '@angular/material/radio';  
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';   
import { AppRoutingModule } from './app-routing.module';  
import { LayoutComponent } from './layout/layout.component';
import {MatDialogModule} from "@angular/material";
import { HashLocationStrategy, LocationStrategy,DatePipe,DecimalPipe } from '@angular/common'; // chandra
import { MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { BreadcrumbComponent } from './navigation/breadcrumb/breadcrumb.component';
import { NotFoundComponent } from './error-pages/not-found/not-found.component';
import { TextMaskModule } from 'angular2-text-mask';   
import {MatAutocompleteModule} from '@angular/material/autocomplete';

import { AppComponent } from './app.component';  
import { ServerErrorComponent } from './error-pages/server-error/server-error.component';
import { ConfirmDialogComponent } from './commoncomponents/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './commoncomponents/alert-dialog/alert-dialog.component';
import { AlertComponent } from '@/_components'; 
import { JwtInterceptor, ErrorInterceptor } from '@/_helpers';
import { LoginComponent } from '@/login';

//Custom component.
import {AllowNumericsDirective} from './shared/allow-numerics.directive';

//Admin Screen Components.
import { RolescreenComponent } from './businesscomponents/admin/roles/roles.component'; 
import { UserComponent } from './businesscomponents/admin/user/user.component';  
import { DepartmentComponent } from './businesscomponents/admin/department/department.component';  
import { RolesDialogComponent } from './businesscomponents/admin/user/roles-dialog/roles-dialog.component';  
import {  FeedescriptionComponent} from './businesscomponents/admin/feedescription/feedescription.component';  
import { ConfigurationComponent } from './businesscomponents/admin/configuration/configuration.component'; 
import { ShipmentmethodComponent } from './businesscomponents/admin/shipmentmethod/shipmentmethod.component';
import { StatesComponent } from './businesscomponents/admin/states/states.component';  
import { RateDescriptionComponent } from './businesscomponents/admin/rate-description/rate-description.component';  
import { SizeComponent } from './businesscomponents/admin/size/size.component';
import {ApptypeComponent} from './businesscomponents/admin/apptype/apptype.component'
import {FlagtypeComponent} from './businesscomponents/admin/flagtype/flagtype.component'
import {PerfpatternsComponent} from './businesscomponents/admin/perfpatterns/perfpatterns.component'
import { SoftwareComponent } from './businesscomponents/admin/software/software.component'
import { PratesComponent } from './businesscomponents/admin/prates/prates.component'; 
//HomeComponent.
import { HomeComponent } from './home/home.component';

//Postage
import { UpdatepostageComponent } from './businesscomponents/Postage/updatepostage/updatepostage.component';
import { OuncesDialogComponent } from './businesscomponents/Postage/ounces-dialog/ounces-dialog.component';
import { ChargesDialogComponent } from './businesscomponents/Postage/charges-dialog/charges-dialog.component';
import { CommentsDialogComponent } from './businesscomponents/Postage/comments-dialog/comments-dialog.component';
import { PostalReportsComponent } from './businesscomponents/Postage/postal-reports/postal-reports.component';
import { ViewpostagesComponent } from './businesscomponents/Postage/viewpostages/viewpostages.component';
import { FileAdjustmentComponent } from './businesscomponents/File-Adjustment/file-adjustment/file-adjustment.component';

//AdditionalChargesComponent
import { AdditionalChargesComponent } from './businesscomponents/Additional_Charges/additional-charges/additional-charges.component';
import { ViewAdditionalChargesComponent } from './businesscomponents/Additional_Charges/view-additional-charges/view-additional-charges.component';

//Running Summary
import { RunningSummaryComponent } from './businesscomponents/Running_Summary/running-summary/running-summary.component';

//Customer
import { ViewcustomerComponent } from './businesscomponents/Customer/viewcustomer/viewcustomer.component'; 
import { AddcustomerComponent } from './businesscomponents/Customer/addcustomer/addcustomer.component'; 
import { ContactDialogComponent } from './businesscomponents/Customer/contact-dialog/contact-dialog.component'; 
import { ServiceAgreementDialogComponent } from './businesscomponents/Customer/service-agreement-dialog/service-agreement-dialog.component';

//Insert
import { ViewinsertComponent } from './businesscomponents/Insert/viewinsert/viewinsert.component';
import { AddinsertDialogComponent } from './businesscomponents/Insert/addinsert-dialog/addinsert-dialog.component';

//change print location
import { PrintLocationComponent } from './businesscomponents/print_location/print-location/print-location.component';
import { InsertsPrintLocationDialogComponent } from './businesscomponents/print_location/inserts-print-location-dialog/inserts-print-location-dialog.component';

//Application
import { AddApplicationNewComponent } from './businesscomponents/Application/add-application-new/add-application-new.component'; 
import { NotificationsDialogComponent } from './businesscomponents/Application/notifications-dialog/notifications-dialog.component'; 
import { HeldaddressDialogComponent } from './businesscomponents/Application/heldaddress-dialog/heldaddress-dialog.component';
import { ViewapplicationComponent } from './businesscomponents/Application/viewapplication/viewapplication.component'; 


// pdf viewer
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import{PdfViewerComponent} from './pdf-viewer/pdf-viewer.component';
import { ContractDialogComponent } from './businesscomponents/Customer/contract-dialog/contract-dialog.component';
import { BillingRateDialogComponent } from './businesscomponents/Customer/billing-rate-dialog/billing-rate-dialog.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { BrowserOptionsComponent } from './browser-options/browser-options.component';
import { NotAuthorizeComponent } from './error-pages/not-authorize/not-authorize.component';

//Reports 
import { ReportsComponent } from './businesscomponents/reports/reports.component';

//Can Deactivate Guard.
import{CanDeactivateGuard} from '../app/_guards/can-deactivate.guard';


@NgModule({  
  declarations: [  
    AppComponent,  
    LayoutComponent, HomeComponent, HeaderComponent, 
	SidenavListComponent, BreadcrumbComponent, NotFoundComponent, 
	ServerErrorComponent, AlertDialogComponent, ConfirmDialogComponent,
	LoginComponent,
	AlertComponent, 
	ConfigurationComponent,
	UserComponent,
  RolescreenComponent,
  RolesDialogComponent,
  AllowNumericsDirective,
  DepartmentComponent,
  UpdatepostageComponent,
  OuncesDialogComponent,
  FileAdjustmentComponent,
  ChargesDialogComponent,
  CommentsDialogComponent,
  PostalReportsComponent,
  ViewpostagesComponent,
  FeedescriptionComponent,
  AdditionalChargesComponent,
  ViewAdditionalChargesComponent,
  ViewcustomerComponent,
  AddcustomerComponent,
  ShipmentmethodComponent,
  StatesComponent,
  ContactDialogComponent,
  ServiceAgreementDialogComponent,
  RunningSummaryComponent,
  ViewinsertComponent,
  AddinsertDialogComponent,
  RateDescriptionComponent,
  PrintLocationComponent,
  InsertsPrintLocationDialogComponent,
  AddApplicationNewComponent,
  NotificationsDialogComponent,
  HeldaddressDialogComponent,
  ViewapplicationComponent,
  SizeComponent,
  FlagtypeComponent,
  ApptypeComponent,
  PerfpatternsComponent,
  PdfViewerComponent,
  ContractDialogComponent,
  BillingRateDialogComponent,
  FooterComponent,
  BrowserOptionsComponent,
  NotAuthorizeComponent,
  SoftwareComponent,
  ReportsComponent,
  PratesComponent
	],  
    	
  imports: [  
    BrowserModule,  
    FormsModule,  
    ReactiveFormsModule,  
    HttpClientModule,  
    BrowserAnimationsModule,  
    MatButtonModule,  
    MatMenuModule,  
    MatDatepickerModule,  
    MatNativeDateModule,  
    MatIconModule,  
    MatRadioModule,  
    MatCardModule,  
    MatSidenavModule,  
    MatFormFieldModule,  
    MatInputModule,  
    MatTooltipModule,  
    MatToolbarModule,  
    AppRoutingModule,
	MatTableModule,
	MatSortModule,
	FlexLayoutModule,
	MatPaginatorModule,
	MatTabsModule,
	MatListModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatCheckboxModule,
	MatDialogModule,
	MatSelectModule,
  MatAutocompleteModule,
  MatExpansionModule,
  TextMaskModule,
  PdfViewerModule,
  NgxExtendedPdfViewerModule

  ],  
  providers: [
        
    //fakeBackendProvider,
    HttpClientModule, 
    CanDeactivateGuard,
		//?? EmployeeService,
		MatDatepickerModule,
		// the below interceptors MAY?? make the real pages fail... Comment them once back end is ready
		{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
 
    {provide: LocationStrategy, useClass: HashLocationStrategy},  // Chandra
 
        // satya - 03/11/2019  adding AppComponent as a provider so that
		// its log out method can be called by Header component.
		//AppComponent,
		HeaderComponent,
		
		{ provide: MatDialogRef, useValue: {} },
		{ provide: MAT_DIALOG_DATA, useValue: [] },DatePipe,DecimalPipe
	
		
	/* 	{
			provide: ErrorStateMatcher,
			useClass: ErrorMatcher
		} */
    ],
  
  bootstrap: [AppComponent],
  entryComponents: [AlertDialogComponent,ConfirmDialogComponent, OuncesDialogComponent,ChargesDialogComponent,CommentsDialogComponent,RolesDialogComponent
    ,ContactDialogComponent,ServiceAgreementDialogComponent,InsertsPrintLocationDialogComponent,NotificationsDialogComponent,
    AddApplicationNewComponent,PdfViewerComponent,ContractDialogComponent,BillingRateDialogComponent,BrowserOptionsComponent
  ] 
})  
export class AppModule { }  
