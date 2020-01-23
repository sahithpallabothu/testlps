import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';

import { HomeComponent } from './home/home.component';

import { NotFoundComponent } from './error-pages/not-found/not-found.component';
import { ServerErrorComponent } from './error-pages/server-error/server-error.component';
import { NotAuthorizeComponent } from './error-pages/not-authorize/not-authorize.component';

import { LoginComponent } from './login';
import { AuthGuard } from './_guards';

import { CanDeactivateGuard } from './_guards/can-deactivate.guard';
//Admin Screens.
import { FeedescriptionComponent } from './businesscomponents/admin/feedescription/feedescription.component'; 
import { RolescreenComponent } from './businesscomponents/admin/roles/roles.component';   
import { StatesComponent } from './businesscomponents/admin/states/states.component';  
import { DepartmentComponent } from './businesscomponents/admin/department/department.component';
import { UserComponent } from './businesscomponents/admin/user/user.component';  
import { ShipmentmethodComponent } from './businesscomponents/admin/shipmentmethod/shipmentmethod.component';
import { RateDescriptionComponent } from './businesscomponents/admin/rate-description/rate-description.component';  
import {SizeComponent} from './businesscomponents/admin/size/size.component'
import { ApptypeComponent } from './businesscomponents/admin/apptype/apptype.component'; 
import { FlagtypeComponent } from './businesscomponents/admin/flagtype/flagtype.component';
import { PerfpatternsComponent } from './businesscomponents/admin/perfpatterns/perfpatterns.component';
import { SoftwareComponent } from './businesscomponents/admin/software/software.component';
import { PratesComponent } from './businesscomponents/admin/prates/prates.component'; 
//Customer
import { ViewcustomerComponent } from './businesscomponents/Customer/viewcustomer/viewcustomer.component'; 
import { AddcustomerComponent } from './businesscomponents/Customer/addcustomer/addcustomer.component'; 

//AdditionalChargesComponent
import { AdditionalChargesComponent } from './businesscomponents/Additional_Charges/additional-charges/additional-charges.component';
import { ViewAdditionalChargesComponent } from './businesscomponents/Additional_Charges/view-additional-charges/view-additional-charges.component';


//Running Summary 
import { RunningSummaryComponent } from './businesscomponents/Running_Summary/running-summary/running-summary.component';

//postageComponent
import { UpdatepostageComponent } from './businesscomponents/Postage/updatepostage/updatepostage.component';
import { FileAdjustmentComponent } from './businesscomponents/File-Adjustment/file-adjustment/file-adjustment.component';
//inserts
import { AddinsertDialogComponent } from './businesscomponents/Insert/addinsert-dialog/addinsert-dialog.component';
import { ViewinsertComponent } from './businesscomponents/Insert/viewinsert/viewinsert.component';

//change print location
import { PrintLocationComponent } from './businesscomponents/print_location/print-location/print-location.component';

//application
import { AddApplicationNewComponent } from './businesscomponents/Application/add-application-new/add-application-new.component'; 
import { ViewapplicationComponent } from './businesscomponents/Application/viewapplication/viewapplication.component';  

//Reports
import { ReportsComponent } from './businesscomponents/reports/reports.component'

const routes: Routes = [
//Home Component.
{path:'home',component:HomeComponent,data: { bc: '' }, canActivate: [AuthGuard]},

//Admin Screens.
{path:'admin_department',component:DepartmentComponent,canDeactivate: [CanDeactivateGuard],data: { bc: 'Department' },},
{path:'admin_users',component:UserComponent,data: { bc: 'Users' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_roles',component:RolescreenComponent,data: { bc: 'Roles' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_feedescription',component:FeedescriptionComponent,data: { bc: 'Fee Description' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_states',component:StatesComponent,data: { bc: 'States' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_shipmentmethod',component:ShipmentmethodComponent,data: { bc: 'Shipment Method' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_ratedescription',component:RateDescriptionComponent,data: { bc: 'Rate Type' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_size',component:SizeComponent,data: { bc: 'Size' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_flag',component:FlagtypeComponent,data: { bc: 'Flag' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_perfpatterns',component:PerfpatternsComponent,data: { bc: 'Perforation Patterns' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_apptype',component:ApptypeComponent,data: { bc: 'App Type' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_software',component:SoftwareComponent,data: { bc: 'Software' },canDeactivate: [CanDeactivateGuard]},
{path:'admin_prates',component:PratesComponent,canDeactivate: [CanDeactivateGuard], data: { bc: 'Postage Rates'},},
//postage
{path:'update_postages',component:UpdatepostageComponent,data: { bc: 'File Counts' },canDeactivate: [CanDeactivateGuard]},
{path:'update_postages/:id/:runDate/:recordID',component:UpdatepostageComponent,data: { bc: 'File Counts' },canDeactivate: [CanDeactivateGuard]},
{path:'file_adjustment',component:FileAdjustmentComponent,data: { bc: 'File Adjustment' },},

//customer
{path:'view_customer',component:ViewcustomerComponent,data: { bc: ' Customer' },},
{path:'add_customer',component:AddcustomerComponent,data: { bc: 'Add Customer' },canDeactivate: [CanDeactivateGuard]},
{path:'add_customer/:id',component:AddcustomerComponent,data: { bc: 'Edit Customer' },canDeactivate: [CanDeactivateGuard]},

//AdditionalChargesComponent
{path:'additional_charges',component:AdditionalChargesComponent,data: { bc: 'Additional Charges' },canDeactivate: [CanDeactivateGuard]},
{path:'view_additional_charges',component:ViewAdditionalChargesComponent,data: { bc: 'Additional Charges' },},

//Running Summary 
{path:'runningsummary',component:RunningSummaryComponent,data: { bc: 'Running Summary' },canDeactivate: [CanDeactivateGuard]},
//insert
{path:'add_insert/:id/:insertType/:startDate/:endDate',component:AddinsertDialogComponent,data: { bc: 'Edit Inserts' },canDeactivate: [CanDeactivateGuard]},
{path:'add_insert/:id',component:AddinsertDialogComponent,data: { bc: 'Edit Inserts' },canDeactivate: [CanDeactivateGuard]},
{path:'add_insert',component:AddinsertDialogComponent,data: { bc: 'Add Inserts' },canDeactivate: [CanDeactivateGuard]},
{path:'view_insert',component:ViewinsertComponent,data: { bc: 'Inserts' },},

//change print location
{path:'print_location',component:PrintLocationComponent,data: { bc: 'Change Print Location' },canDeactivate: [CanDeactivateGuard]},
//application
{path:'add_application',component:AddApplicationNewComponent,data: { bc: 'Add Application' },canDeactivate: [CanDeactivateGuard]},
{path:'add_application/:id',component:AddApplicationNewComponent,data: { bc: 'Edit Application' },canDeactivate: [CanDeactivateGuard]},
{path:'add_application/:name/:code/:custid',component:AddApplicationNewComponent,data: { bc: 'Add Application' },canDeactivate: [CanDeactivateGuard]},
{path:'view_application',component:ViewapplicationComponent,data: { bc: 'View Application' },},


//ReportsComponent
{path:'reports',component:ReportsComponent,data: { bc: 'Reports' },},

{path: 'login', component: LoginComponent},
{path: 'SuperAdminLogin', component: LoginComponent}, // "SuperAdminLogin" constant needs to be modified if Path changed.

{path:'401',component:NotAuthorizeComponent,data: { bc: '-- Not Authorized --' },},
{path:'404',component:NotFoundComponent,data: { bc: '-- Navigation Error --' },},
{path: '500', component: ServerErrorComponent,data: { bc: '-- Server Error --' }, },

{path:'', redirectTo: '/home', pathMatch: 'full'},
{path: '**', redirectTo: '/404', pathMatch: 'full'},

];
@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)], // , useHash: true ], // Chandra
  exports: [RouterModule],
  declarations:[]
})
export class AppRoutingModule { }
