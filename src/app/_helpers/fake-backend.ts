import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User } from '@/businessclasses/admin/User';
import { Role,privileges } from '@/businessclasses/admin/Role';

// import { Apptype } from '@/businessclasses/admin/apptype';
// import { Flagtype } from '@/businessclasses/admin/flagtype';
// import { Feedescription } from '@/businessclasses/admin/feedescription';
// import { Perfpatterns } from '@/businessclasses/admin/perfpatterns';

// import { States } from '@/businessclasses/admin/states';
import { Department } from '@/businessclasses/admin/department';
// import { CRates } from '@/businessclasses/admin/crates';
// import { Pcardrates } from '@/businessclasses/admin/pcardrates';
// import { Groups } from '@/businessclasses/admin/groups';
// import { Prates } from '@/businessclasses/admin/prates'; 
//import { Customer,HeldAddress,contact,ApplicationData,serviceAgreementModel,supplementaryServiceAgreementModel,billingrateModal} from '@/businessclasses/Customer/customer';
import { Customer} from '@/businessclasses/Customer/customer';
import { contact} from '@/businessclasses/Customer/contact';
//import { ApplicationData,serviceAgreementModel,supplementaryServiceAgreementModel,billingrateModal} from '@/businessclasses/Customer/ServiceAgreement';

import { Application } from '@/businessclasses/Application/application';
import { Notification } from '@/businessclasses/Application/notification';
//import { Job,Inserts} from '@/businessclasses/home/home';
import { Job} from '@/businessclasses/home/home';
// import { Inserts } from '@/businessclasses/Inserts/Insert';
// import { Postage,typeOfCharges } from '@/businessclasses/Postage/postage';
// import { Runtypeorder } from '@/businessclasses/admin/runtypeorder';  
// import { Shipmentmethod } from '@/businessclasses/admin/shipmentmethod'; 
// import { NonBillableRates } from '@/businessclasses/admin/nonbillablerates';
// import { postageOrder } from '@/businessclasses/admin/postageorder';
@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // const users: User[] = [
            // { id: 1, username: 'prasad', password: 'prasad', firstName: 'Prasad', lastName: 'Gunturi', userRoles:[{roleId:1, roleName:'user'}] },
			// { id: 2, username: 'siva', password: 'siva', firstName: 'Sivananda', lastName: 'Nyayapathi' , userRoles:[{roleId:1, roleName:'user'}] },
			// { id: 3, username: 'prasanth', password: 'prasanth', firstName: 'Prasanth', lastName: 'Pagadala', userRoles:[{roleId:1, roleName:'user'}] } //,
			// // { id: 4, username: 'user1', password: 'user1', firstName: 'User', lastName: 'User', userRoles:[{roleId:1, roleName:'user'}] }
        // ];
	/* 	const users: User[] = [
            { id: 1,isActive: true,description:'Management', department: 'Management', username: 'Leesa', password: 'leesa', firstName: 'Leesa', lastName: 'Wagener', userRoles:[{roleId:1, roleName:'Admin',selected:true},{roleId:3, roleName:'Management',selected:true}] },
			{ id: 2,isActive: true,description:'Billing', department: 'Billing', username: 'Mike', password: 'mike', firstName: 'Mike', lastName: 'Finke' , userRoles:[{roleId:2, roleName:'Billing',selected:true}] },
			{ id: 3, isActive: true,description:'Admin', department: 'Admin',username: 'Harold', password: 'harold', firstName: 'Harold', lastName: 'Howard', userRoles:[{roleId:1, roleName:'Admin',selected:true}] }, //,
			{ id: 4, isActive: true,description:'Billing', department: 'Billing',username: 'Catrina', password: 'catrina', firstName: 'Catrina', lastName: 'Duncan', userRoles:[{roleId:2, roleName:'Billing',selected:true}] }, //,
			{ id: 5, isActive: true,description:'Billing', department: 'Billing',username: 'Matt', password: 'matt', firstName: 'Matt', lastName: 'Early', userRoles:[{roleId:2, roleName:'Billing',selected:true}] } //,
		
        ]; */

        const authHeader = request.headers.get('Authorization');
        const isLoggedIn = authHeader && authHeader.startsWith('Bearer fake-jwt-token');

        // wrap in delayed observable to simulate server api call
        return of(null).pipe(mergeMap(() => {
           
		   console.log("return of(null).pipe(mergeMap(() => {");
		   
		   
            // authenticate - public
          /*   if (request.url.endsWith('/users/authenticate/') && request.method === 'POST') {
				
				console.log(" --  authenticate - public ---");
				
                const user = users.find(x => x.username === request.body.username && x.password === request.body.password);
               // if (!user) return  of(new HttpResponse({ status:401, statusText : 'Username or password is incorrect' }));
			   if (!user) return error("Invalid credentials");
                return ok({
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token: `fake-jwt-token`
                });
            }

			if (request.url.endsWith('/Users/GetAllUsers/') && request.method === 'GET') {
    			
                return ok(users);
            } */
			
        		
			/* if (request.url.endsWith('/Roles/GetAllRoles/') && request.method === 'GET') {


				const roles: Role[] = [
					{
						roleId: 1, roleName: 'Admin', comments: 'Administration ', roleActive: true, selected: false, privileges:
						 [{ screenId: 1, screenName: "Home", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
						{ screenId: 2, screenName: "Postage", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
						{ screenId: 3, screenName: "Inserts", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
						{ screenId: 4, screenName: "Running Summary", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
						{ screenId: 5, screenName: "Reports", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
						{ screenId: 6, screenName: "Customer", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
						{ screenId: 7, screenName: "Application", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
						{ screenId: 8, screenName: "Change Print Location", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
						{ screenId: 9, screenName: "Admin Screens", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: false }
						]
					},

					{
						roleId: 2, roleName: 'Billing ', comments: ' Billing Role', roleActive: true, selected: false, privileges:
						[{ screenId: 1, screenName: "Home", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
						{ screenId: 2, screenName: "Postage", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
						{ screenId: 3, screenName: "Inserts", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
						{ screenId: 4, screenName: "Running Summary", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
						{ screenId: 5, screenName: "Reports", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
						{ screenId: 6, screenName: "Customer", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
						{ screenId: 7, screenName: "Application", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
						{ screenId: 8, screenName: "Change Print Location", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
						{ screenId: 9, screenName: "Admin Screens", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false }
						]
					},

					{
						roleId: 3, roleName: 'Manager', comments: 'Manager Role', roleActive: true, selected: false, privileges:
						[{ screenId: 1, screenName: "Home", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
						{ screenId: 2, screenName: "Postage", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
						{ screenId: 3, screenName: "Inserts", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
						{ screenId: 4, screenName: "Running Summary", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
						{ screenId: 5, screenName: "Reports", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
						{ screenId: 6, screenName: "Customer", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
						{ screenId: 7, screenName: "Application", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
						{ screenId: 8, screenName: "Change Print Location", read: true, insert: true, update: true, delete: true, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
						{ screenId: 9, screenName: "Admin Screens", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false }
						]
					},
					{
						roleId: 4, roleName: 'View Only', comments: 'View Only  Access ', roleActive: true, selected: false, privileges:
							[{ screenId: 1, screenName: "Home", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
							{ screenId: 2, screenName: "Postage", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
							{ screenId: 3, screenName: "Inserts", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
							{ screenId: 4, screenName: "Running Summary", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
							{ screenId: 5, screenName: "Reports", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
							{ screenId: 6, screenName: "Customer", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
							{ screenId: 7, screenName: "Application", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
							{ screenId: 8, screenName: "Change Print Location", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
							{ screenId: 9, screenName: "Admin Screens", read: true, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false }
							]
					}

				];


				return ok(roles);
			}
 */
		/* 		if (request.url.endsWith('/Roles/GetAllPrivileges/') && request.method === 'GET') {
				const privileges: privileges[] = [
					{ screenId: 1, screenName: "Home", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
					{ screenId: 2, screenName: "Postage", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
					{ screenId: 3, screenName: "Inserts", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false },
					{ screenId: 4, screenName: "Running Summary", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
					{ screenId: 5, screenName: "Reports", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: true, dDisable: true },
					{ screenId: 6, screenName: "Customer", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
					{ screenId: 7, screenName: "Application", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: true },
					{ screenId: 8, screenName: "Change Print Location", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: true, uDisable: false, dDisable: true },
					{ screenId: 9, screenName: "Admin Screens", read: false, insert: false, update: false, delete: false, rDisable: false, iDisable: false, uDisable: false, dDisable: false },

				];
				return ok(privileges);
			} */
			//  if ((request.url.indexOf('/shipmentmethod/getAllShipmentMethods/') > 0) && request.method === 'GET') {
                
			// 	const shipmentmethod: Shipmentmethod[]  = [
			// 		  { "shipmentMethodId":1, "shipmentMethod":"USPS"},
			// 		  { "shipmentMethodId":2, "shipmentMethod":"Fedex"},
			// 		  { "shipmentMethodId":3, "shipmentMethod":"UPS"},
			// 		  { "shipmentMethodId":4, "shipmentMethod":"Priority"},
			// 		  { "shipmentMethodId":5, "shipmentMethod":"Next day air"},
			// 		  ]; 
				
            //     return ok(shipmentmethod);
            // }	
			
			//  if ((request.url.indexOf('/department/getAllDepartments/') > 0) && request.method === 'GET') {
                
			// 	const DepartmentData: Department[]  = [
			// 		  { "departmentId":1, "department":"Admin","description":"Administration"},
			// 		  { "departmentId":2, "department":"Billing","description":"Billing department"},
			// 		  { "departmentId":3, "department":"Management","description":"Management department"}
			// 		  ]; 
				
            //     return ok(DepartmentData);
            // }
			
			// //get all run type orders
			//  if ((request.url.indexOf('/runtypeorder/getAllRunTypeOrders/') > 0) && request.method === 'GET') {
                
			// 	const runTypeOrder: Runtypeorder[]  = [
			// 		//   { "runTypeOrderID":1, "runType":"Run type 1", "order":1, "alias": "Alias 1"},
			// 		//   { "runTypeOrderID":2, "runType":"Run type 2", "order":2, "alias": "Alias 2"},
			// 		//   { "runTypeOrderID":3, "runType":"Run type 3", "order":3, "alias": "Alias 3"},
			// 		//   { "runTypeOrderID":4, "runType":"Run type 4", "order":4, "alias": "Alias 4"},
			// 		//   { "runTypeOrderID":5, "runType":"Run type 5", "order":5, "alias": "Alias 5"},
			// 		  ]; 
				
            //     return ok(runTypeOrder);
            // }	

				

			
		   /*  // get all Roles Screen
            if ((request.url.indexOf('/Roles/GetRoleById/') > 0) && request.method === 'GET') {
                
				const role: Role  = { roleId: 1, roleName: 'Admin'}; 
				
                return ok(role);
            }	 */
				// get all Customers Screen
           /*  if (request.url.endsWith('/Customers/GetAllCustomers/') && request.method === 'GET') {
                
				const Customers: Customer[] = [
				{customername : 'Albemarle EMC',customercode :'ALB',sedc : 'Yes',
				active: 'Yes',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '123580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: 'Northlake',mailingstate : 'AL',mailingzipcode: '30084',				
				physicaladdress1: 'Habersham At Northlake GA ',
				physicalcity: 'Northlake',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180635',
				crid: '11698912',ivr: 'Yes',comments: 'Customer comments'},
				
				
				{customername : ' Athens-Clarke County Public Utilities (GA)',customercode :'APU',sedc : 'No',
				active: 'Yes',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '124585',mailingaddress1:  ' Tampa@capricornsys.com ',			
				mailingcity: 'Tampa',mailingstate : 'AL',mailingzipcode: '33618',				
				physicaladdress1: 'Habersham At Northlake GA ',
				physicalcity: 'Northlake',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180643',
				crid: '4181124',ivr: 'No',comments: ' Comments by customer comments by customer '},
				
				
				{customername : 'Bartholomew County REMC',customercode :'BRI',sedc : 'Yes',
				active: 'No',telephone:' (608) 567-6179 ',fax: '(678) 514-1081 ',
				speeddail: '124580',mailingaddress1:  ' jax@capricornsys.com ',			
				mailingcity: 'Jacksonville',mailingstate : 'AL',mailingzipcode: '32202',				
				physicaladdress1: 'Groover-Stewart Building 25 N. Market St.',
				physicalcity: 'Jacksonville',physicalState : 'GA',physicalzipcode: '32202',mailerid: '901180649',
				crid: '3455133',ivr: 'Yes',comments: 'Customer comments'},
				
				{customername : ' Cablevision of Marion County',customercode :'MCF',sedc : 'No',
				active: 'Yes',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '224580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: 'Washington',mailingstate : 'AL',mailingzipcode: '3569',				
				physicaladdress1: 'Habersham At Washington GA ',
				physicalcity: 'Washington',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180665',
				crid: '11698942',ivr: 'No',comments: 'Customer comments'},
				
				{customername : ' Citizens Electric Corporation',customercode :'CEM',sedc : 'Yes',
				active: 'No',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '225580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: ' New York ',mailingstate : 'AL',mailingzipcode: '3569',				
				physicaladdress1: 'Habersham At  New York  GA ',
				physicalcity: ' New York ',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180683',
				crid: '2762440',ivr: 'Yes',comments: 'Customer comments'},
				
				
				{customername : 'City of Laurel Public Utility',customercode :'LMS',sedc : 'Yes',
				active: 'No',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '223580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: 'Texas',mailingstate : 'AL',mailingzipcode: '3569',				
				physicaladdress1: 'Habersham At Texas GA ',
				physicalcity: 'Texas',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180711',
				crid: '8773875',ivr: 'No',comments: 'Customer comments'},
				
				{customername : ' Deep East Texas ECI',customercode :'DET',sedc : 'No',
				active: 'Yes',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '123580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: 'Florida',mailingstate : 'AL',mailingzipcode: '3569',				
				physicaladdress1: 'Habersham At Florida GA ',
				physicalcity: 'Florida',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180750',
				crid: '2411482',ivr: 'Yes',comments: 'Customer comments'},
				
				{customername : 'PenTex Energy',customercode :'CCT',sedc : 'Yes',
				active: 'No',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '124580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: 'Missouri',mailingstate : 'AL',mailingzipcode: '3569',				
				physicaladdress1: 'Habersham At Missouri GA ',
				physicalcity: 'Missouri',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180742',
				crid: '3480358',ivr: 'No',comments: 'Customer comments'},
				
				{customername : 'Starkville Utilities',customercode :'SEM',sedc : 'No',
				active: 'Yes',telephone:'(678) 514-1080',fax: '(678) 514-1081 ',
				speeddail: '324580',mailingaddress1:  'info@capricornsys.com',			
				mailingcity: 'Hawaii',mailingstate : 'AL',mailingzipcode: '3569',				
				physicaladdress1: 'Habersham At Hawaii GA ',
				physicalcity: 'Hawaii',physicalState : 'GA',physicalzipcode: '30084',mailerid: '901180935',
				crid: '4335983',ivr: 'Yes',comments: 'Customer comments'},
				
				];
				
                return ok(Customers);
            }		
			
			 // Get customer by ID
            if ((request.url.indexOf('/Customers/GetCustomerById/') > 0) && request.method === 'GET') {
                
				console.log("customer by ID",request.urlWithParams);
				console.log(request.url);
				const customer: Customer  = {
					customername : 'Starkville Utilities',
					customercode :'SEM',
					sedc : 'Yes',
					active: 'No',
					telephone:'(678) 514-1080',
					fax: '(678) 514-1081 ',
					speeddail: '2580',
					mailingaddress1:  'Habersham At Hawaii GA',			
					mailingcity: 'Hawaii',
					mailingstate : 'GA',
					mailingzipcode: '3569',				
					physicaladdress1: 'Habersham At Missouri GA ',
					physicalcity: 'Missouri',
					physicalState : 'GA',
					physicalzipcode: '30084',
					mailerid: '901180935',
					crid: '4335983',
					ivr: 'Yes',
					comments: 'Customer comments'
				}
				
                return ok(customer);
            } */

				
		/* 	// get all Held Addresses 
            if (request.url.endsWith('/Customers/GetAllHeldAddress/') && request.method === 'GET') {
                
				const HeldAddresses: HeldAddress[] = [			
					{	
						id:1,
						contactname:'Bruce Wayne',
						address1:'Newyork',
						address2:'Habersham ',
						city:'Northlake',
						state:'GA',
						shipmentMethod:'USPS',
						zip:'30084'
					},
					{	
						id:2,
						contactname:'Steve Rogers',
						address1:'Florida',
						address2:'Sham FL',
						city:'Florida',
						state:'GA',
						shipmentMethod:'Fedex',
						zip:'30084'
					},
					{	
						id:3,
						contactname:'Tony Stark',
						address1:'Hawaii',
						address2:'Haber MN ',
						city:'Hawaii',
						state:'MN',
						shipmentMethod:'UPS',
						zip:'30084'
					},
					{	
						id:4,
						contactname:'Zampa',
						address1:'Missouri',
						address2:'Sham MN ',
						city:'Missouri',
						state:'MN',
						shipmentMethod:'Priority',
						zip:'30084'
					},
					 {
						id:5,
						contactname:'Warner',						
						address1:'Tampa',
						address2:'Tampa MN ',
						city:'Tampa',
						state:'MN',
						shipmentMethod:'USPS',
						zip:'30084'
					},
				];
				return ok(HeldAddresses);
			}
			
			//contacts
			const contacts: contact[] = [
					{	id:1,firstname:'John',lastname:'Smith',contacttitle:'GM',
						email:'info@capricornsys.com',directphone:'(678) 514-1080',
						extension:'3084',cellphone:'9854654544',
						home:'(678) 514-1081',comments:'Nothing',				
						primary:'Yes',primaryalt:'No',oob:'Yes',
						delq:'No',cc:'Yes',ebpp:'No',
						insert:'Yes',insertalt:'No',emailconf:'Yes',				
					},
					{	
						id:2,firstname:'James',lastname:'Smith ',contacttitle:'Manager',
						email:'info@capricornsys.com',directphone:'(678) 514-1080',
						extension:'3084',cellphone:'9854654544',
						home:'(678) 514-1082',comments:'Nothing',				
						primary:'Yes',primaryalt:'No',oob:'Yes',
						delq:'No',cc:'Yes',ebpp:'No',
						insert:'Yes',insertalt:'No',emailconf:'Yes',				
					},
					{	
						id:3,firstname:'Mary',lastname:'Linda ',contacttitle:'Technician',
						email:'info@capricornsys.com',directphone:'(678) 514-1080',
						extension:'3084',cellphone:'9854654544',
						home:'(678) 514-1083',comments:'Nothing',				
						primary:'No',primaryalt:'Yes',oob:'No',
						delq:'Yes',cc:'No',ebpp:'Yes',
						insert:'No',insertalt:'Yes',emailconf:'No',				
					},
					{	
						id:4,firstname:'Betty',lastname:'Helen ',contacttitle:'Supervisor',
						email:'info@capricornsys.com',directphone:'(678) 514-1080',
						extension:'3184',cellphone:'9854654544',
						home:'(678) 514-1085',comments:'Nothing',				
						primary:'Yes',primaryalt:'No',oob:'Yes',
						delq:'No',cc:'Yes',ebpp:'No',
						insert:'Yes',insertalt:'No',emailconf:'Yes',				
					},
					{	
						id:5,firstname:'Charles',lastname:'Paul',contacttitle:'GM',
						email:'info@capricornsys.com',directphone:'(678) 514-1080',
						extension:'3384',cellphone:'9854654544',
						home:'(678) 514-1086',comments:'Nothing',				
						primary:'No',primaryalt:'Yes',oob:'No',
						delq:'Yes',cc:'No',ebpp:'Yes',
						insert:'No',insertalt:'Yes',emailconf:'No',				
					},
					{	
						id:6,firstname:'Paul',lastname:'Paul ',contacttitle:'Technician',
						email:'info@capricornsys.com',directphone:'678-514-1080',
						extension:'3064',cellphone:'9854654544',
						home:'(678) 514-1087',comments:'Nothing',				
						primary:'Yes',primaryalt:'No',oob:'Yes',
						delq:'No',cc:'Yes',ebpp:'No',
						insert:'Yes',insertalt:'No',emailconf:'Yes',				
					},
					{	
						id:7,firstname:'Joy',lastname:'Joy',contacttitle:'Supervisor',
						email:'info@capricornsys.com',directphone:'678-514-1080',
						extension:'3784',cellphone:'9854654544',
						home:'(678) 514-1088',comments:'Nothing',				
						primary:'No',primaryalt:'Yes',oob:'No',
						delq:'Yes',cc:'No',ebpp:'Yes',
						insert:'No',insertalt:'Yes',emailconf:'No',					
					},
					{	
						id:8,firstname:'Roy',lastname:'Roy ',contacttitle:'GM',
						email:'info@capricornsys.com',directphone:'678-514-1080',
						extension:'3904',cellphone:'9854654544',
						home:'(678) 514-1089',comments:'Nothing',				
						primary:'Yes',primaryalt:'No',oob:'Yes',
						delq:'No',cc:'Yes',ebpp:'No',
						insert:'Yes',insertalt:'No',emailconf:'Yes',				
					},
					{	
						id:9,firstname:'Gary',lastname:'Jason ',contacttitle:'Supervisor',
						email:'info@capricornsys.com',directphone:'678-514-1080',
						extension:'3784',cellphone:'9854654544',
						home:'(678) 514-1285',comments:'Nothing',				
						primary:'No',primaryalt:'Yes',oob:'No',
						delq:'Yes',cc:'No',ebpp:'Yes',
						insert:'No',insertalt:'Yes',emailconf:'No',					
					}
				];
			
			
			// get all contacts 
            if (request.url.endsWith('/Customers/GetAllContacts/') && request.method === 'GET'){			
				return ok(contacts);
			} */
			
			/*// add contact data
            if (request.url.endsWith('/Customers/AddContact/') && request.method === 'POST') {
				console.log("AddContact to Fake Backend");
				console.log(request.body);
				contacts.push(request.body);
				console.log("Added Contact in Fake Backend");
				return ok(contacts);
			}*/
			
			/* 
			// get all Notifications for Applications Screen
            if (request.url.endsWith('/Applications/GetAllNotifications/') && request.method === 'GET') {
                
			
				const Notifications: Notification[] = [
				
				{id:1,contactname : 'Steve Rogers',pdfready :'True',
				filereceived: 'False',jobcompleted:'True',emailrmt: 'False',
				emailcode: 'True',reportcustomer:  'True',			
				email: 'steverogers@gmail.com'},
				
				{id:2,contactname : 'Bruce Wayne' ,pdfready :'True',
				filereceived: 'True',jobcompleted:'False',emailrmt: 'True',
				emailcode: 'False',reportcustomer:  'True',			
				email: 'brucewayne@gmail.com'}
				
				// {id:3,contactname : 'Tony',pdfready :'True',
				// filereceived: 'False',jobcompleted:'True',emailrmt: 'False',
				// emailcode: 'True',reportcustomer:  'False',			
				// email: 'tonystark@gmail.com'}
				
				];
				
                return ok(Notifications);
            } */
			
	/* 		// get all Applications Screen
            if (request.url.endsWith('/Applications/GetAllApplications/') && request.method === 'GET') {
                
			
				const Applications: Application[] = [
				
				{applicationname : 'Albemarle EMC',applicationcode :'ALB',customername : 'Albemarle EMC',
				customerstate: 'LA',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Multi-Top: 3 1/2"',			
				runfrequency: 'Weekly',customercode: 'ALB'},
				
				{applicationname : 'Athens-Clarke County Public Utilities (GA)',applicationcode :'APU',customername : 'Athens-Clarke County Public Utilities (GA)',
				customerstate: 'SF',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Top 3 1/2',			
				runfrequency: 'Weekly',customercode: 'APU'},
				
				{applicationname : 'Bartholomew County REMC CC Check',applicationcode :'BRIR',customername : 'Bartholomew County REMC',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Bottom: 3 11/16"',			
				runfrequency: 'Weekly',customercode: 'BRI'},
				{applicationname : 'Cablevision of Marion County',applicationcode :'MCF',customername : 'Cablevision of Marion County',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Top 3 1/2',			
				runfrequency: 'Weekly',customercode: 'MCF'},
				{applicationname : 'Citizens Electric Corporation',applicationcode :'CEM',customername : 'Citizens Electric Corporation',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Bottom: 3 1/2"',			
				runfrequency: 'Weekly',customercode: 'CEM'},
				{applicationname : 'City of Laurel Public Utility Letter',applicationcode :'LMSL',customername : 'City of Laurel Public Utility',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Top 3 1/2',			
				runfrequency: 'Weekly',customercode: 'LMS'},
				{applicationname : 'Gary Deep East Texas ECI',applicationcode :'GWD',customername : 'Deep East Texas ECI',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Top 3 1/2',			
				runfrequency: 'Weekly',customercode: 'DET'},
				{applicationname : 'PenTex Energy CC Check',applicationcode :'CCTR',customername : 'PenTex Energy',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Bottom: 3 1/2"',			
				runfrequency: 'Weekly',customercode: 'CCT'},
				{applicationname : 'Starkville Utilities Delinquent',applicationcode :'SEMD',customername : 'Starkville Utilities',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Top 3 1/2',			
				runfrequency: 'Weekly',customercode: 'SEM'},
				{applicationname : 'Westminster Utility Department',applicationcode :'WMSW',customername : 'Westminster Utility Department',
				customerstate: 'CI',customerflag:'Arista',apptype: 'Letter',
				software: 'SEDC',perf:  'Bottom: 3 11/16"',			
				runfrequency: 'Weekly',customercode: 'WMS'},
				
				];
				
                return ok(Applications);
            }	 */
			
			/* // get all jobs in home screen 
            if (request.url.endsWith('/home/GetAllJobs/') && request.method === 'GET') {
                
				const Jobs: Job[] = [
				{inputname : 'UMC012017000',outputname : 'UMC012017000',upload : '12/25/2018 12:05:00',received: '12/25/2018 12:25:00',processed: '12/25/2018 12:45:00',Accounts: '2540',rundate: '04/22/2019',billdate:'04/22/2019',posteddate: '04/23/2019 13:05:00',print : 'D'},
				{inputname : 'UMC021618',outputname : 'UMC021618',upload : '11/23/2017 14:05:00',received: '11/23/2017 14:25:00',processed: '11/23/2017 16:05:00',Accounts: '4500',rundate: '04/23/2019',billdate:'04/23/2019',posteddate: '04/24/2019 15:05:00',print : 'W'},
				{inputname : 'UMC10181000',outputname : 'UMC10181000',upload : '08/21/2018 16:05:00',received: '08/21/2018 16:25:00',processed: '08/21/2018 16:55:00',Accounts: '8596',rundate: '04/25/2019',billdate:'04/25/2019',posteddate: '04/25/2019 17:05:00',print : 'D'},
				{inputname : 'UMC011517000',outputname : 'UMC011517000',upload : '05/02/2016 17:05:00',received: '05/02/2016 17:25:00',processed: '05/02/2016 17:05:00',Accounts: '65413',rundate: '04/26/2019',billdate:'04/26/2019',posteddate: '04/26/2019 18:05:00',print : 'W'},
				{inputname : 'UMC011516000',outputname : 'UMC011516000',upload : '03/03/2019 18:05:00',received: '03/03/2019 18:25:00',processed: '03/03/2019 18:05:00',Accounts: '454',rundate: '04/27/2019',billdate:'04/27/2019',posteddate: '04/27/2019 21:05:00',print : 'D'},
				{inputname : 'UMC011518',outputname : 'UMC011518',upload : '04/04/2019 19:05:00',received: '04/04/2019 19:25:00',processed: '04/04/2019 19:05:00',Accounts: '845351',rundate: '04/28/2019',billdate:'04/28/2019',posteddate: '04/29/2019 22:05:00',print : 'W'},
				];
				return ok(Jobs);
			}
			 */
			/* //GetInsertsData
			if (request.url.endsWith('/home/GetInsertsData/') && request.method === 'GET') {
                
				// const Insert: Inserts[] = [
					// {inserttype : 'Selective',startdate: '04/22/2019',enddate:'04/24/2023',weight: '50',code : 'C1',description:'Powerlines',active:'Yes'},
					// {inserttype : 'Global',startdate: '04/23/1999',enddate:'04/25/2010',weight: '60',code : 'C2',description:'EMC Security',active:'No'},
					// {inserttype : 'Selective',startdate: '04/24/2019',enddate:'04/27/2022',weight: '50',code : 'C3',description:'Holiday Schedule',active:'Yes'},
					// {inserttype : 'Selective',startdate: '04/25/2019',enddate:'04/28/2021',weight: '70',code : 'C4',description:'Keep Troup Beautiful',active:'Yes'},
					// {inserttype : 'Global',startdate: '04/26/2002',enddate:'04/29/2004',weight: '80',code : 'C5',description:'News letter',active:'No'},
				// ];
				const Insert: Inserts[] = [
					{
						applicationName:'Albemarle EMC',applicationCode:'SEM',startdate: '04/22/2019',enddate:'12/24/2020',active:'Y',weight:"100",code:"Code 1",description:"EMC Security",inserttype:"Global"
					},
					{
						applicationName:'Cablevision of Marion County',applicationCode:'SEMD',startdate: '01/22/2017',enddate:'02/24/2019',active:'N',weight:"200",code:"Code 2",description:"News letter",inserttype:"Global"
					},
					{
						applicationName:'Citizens Electric Corporation',applicationCode:'SEMR',startdate: '03/15/2016',enddate:'12/24/2022',active:'Y',weight:"300",code:"Code 3",description:"Powerlines",inserttype:"Global"
					},
					{
						applicationName:'Gary Deep East Texas ECI',applicationCode:'SEMS',startdate: '07/17/2016',enddate:'02/14/2021',active:'N',weight:"400",code:"Code 4",description:"Holiday Schedule",inserttype:"Global"
					},
					{
						applicationName:'PenTex Energy CC Check',applicationCode:'SEM',startdate: '02/12/2016',enddate:'05/10/2018',active:'N',weight:"500",code:"Code 5",description:"	Keep Troup Beautiful",inserttype:"Selective"
					},
					{
						applicationName:'PenTex Energy CC Check',applicationCode:'SEMR',startdate: '03/15/2016',enddate:'04/14/2020',active:'Y',weight:"200",code:"Code 6",description:"Powerlines",inserttype:"Selective"
					}
				]
				return ok(Insert);
			}
			 *//* 
			//get all postages
			 if (request.url.endsWith('/Postages/GetAllPostages/') && request.method === 'GET') {
				 const Postages: Postage[] = [
				  {jobName:'UMC012017000',inputName:'UMC012017000',runDate:'02/01/1997'  ,billDate:'02/02/1997' ,oZPermit2:'2 Oz Permit1',oZSingle2:'2 Oz Single1',
				  digit5:'5 Digit1',aadc:'AADC1',mixedAadc:'Mixed AADC1',single:'Single1',globalInsert:'Global Insert1',held:'Held1',
				  outputName : 'UMC012017000',upload : '12/25/2018 12:05:00',received: '12/25/2018 12:25:00',processed: '12/25/2018 12:45:00',accounts: '2540',postedDate: '04/23/2019 12:45:00',print : 'D'},
				  
				  {jobName:'UMC021618',inputName:'UMC021618',runDate:'02/08/1998'  ,billDate:'02/09/1998' ,oZPermit2:'2 Oz Permit2',oZSingle2:'2 Oz Single2',
				  digit5:'5 Digit2',aadc:'AADC2',mixedAadc:'Mixed AADC2',single:'Single2',globalInsert:'Global Insert2',held:'Held2',
				  outputName : 'UMC021618',upload : '11/23/2017 14:05:00',received: '11/23/2017 14:25:00',processed: '11/23/2017 16:05:00',accounts: '4500',postedDate: '04/24/2019 14:45:00',print : 'W'},
				  
				  {jobName:'UMC10181PDF',inputName:'UMC10181PDF',runDate:'05/01/1999'  ,billDate:'05/02/1999' ,oZPermit2:'2 Oz Permit3',oZSingle2:'2 Oz Single3',
				  digit5:'5 Digit3',aadc:'AADC3',mixedAadc:'Mixed AADC3',single:'Single3',globalInsert:'Global Insert3',held:'Held3',
				  outputName : 'UMC10181PDF',upload : '08/21/2018 16:05:00',received: '08/21/2018 16:25:00',processed: '08/21/2018 16:55:00',accounts: '8596',postedDate: '04/25/2019 16:45:00',print : 'D'},
				  
				  {jobName:'UMC011517000',inputName:'UMC011517000',runDate:'05/05/1999'  ,billDate:'05/06/1999' ,oZPermit2:'2 Oz Permit4',oZSingle2:'2 Oz Single4',
				  digit5:'5 Digit4',aadc:'AADC4',mixedAadc:'Mixed AADC4',single:'Single4',globalInsert:'Global Insert4',held:'Held4',
				  outputName : 'UMC011517000',upload : '05/02/2016 17:05:00',received: '05/02/2016 17:25:00',processed: '05/02/2016 17:05:00',accounts: '65413',postedDate: '04/26/2019 17:45:00',print : 'W'},
				  
				  {jobName:'UMC011516000',inputName:'UMC011516000',runDate:'07/08/1999'  ,billDate:'07/09/1999' ,oZPermit2:'2 Oz Permit5',oZSingle2:'2 Oz Single5',
				  digit5:'5 Digit5',aadc:'AADC5',mixedAadc:'Mixed AADC5',single:'Single5',globalInsert:'Global Insert5',held:'Held5',
				  outputName : 'UMC011516000',upload : '03/03/2019 18:05:00',received: '03/03/2019 18:25:00',processed: '03/03/2019 18:05:00',accounts: '454',postedDate: '04/27/2019 18:45:00',print : 'D'},
				  
				  {jobName:'UMC011518',inputName:'UMC011518',runDate:'02/01/2000'  ,billDate:'02/02/2000' ,oZPermit2:'2 Oz Permit6',oZSingle2:'2 Oz Single6',
				  digit5:'5 Digit6',aadc:'AADC6',mixedAadc:'Mixed AADC6',single:'Single6',globalInsert:'Global Insert6',held:'Held6',
				  outputName : 'UMC011518',upload : '04/04/2019 19:05:00',received: '04/04/2019 19:25:00',processed: '04/04/2019 19:05:00',accounts: '845351',postedDate: '04/29/2019 19:45:00',print : 'W'}
				 ];
				 return ok(Postages);
			 }
			
			   //get all charges in postage screen
			 if (request.url.endsWith('/Postages/GetAllCharges/') && request.method === 'GET') {
				 const typeOfCharges: typeOfCharges[] = [
				    {idOfCharge:1,typeOfCharge:"FedEx",amount:"100,150.000",description:"Description 1",date:"01/01/2017",user:"Leesa"},
					{idOfCharge:2,typeOfCharge:"Label Cost",amount:"200,120.050",description:"Description 2",date:"02/01/2018",user:"Mike"},
					{idOfCharge:3,typeOfCharge:"Envelope Insertion",amount:"300,130.090",description:"Description 3",date:"03/01/2019",user:"Leesa"}
			    ];
				 return ok(typeOfCharges);
			 }
			 */
			// //get all ServiceAgreements
			// if (request.url.endsWith('/Customers/GetAllServiceAgreement/') && request.method === 'GET') {
                
	
				// const ServiceAgreements: serviceAgreementModel[] = [
				// {applicationname : 'Starkville Utilities',startdate :'02/23/2001',enddate : '02/23/2011',
				// initialterm: '1',renewalterm:'11',terminationnotice: '30',
				// // sedcmbr: '2',file:  'Albemarle EMC Contract.docx',fileUrl:'../../../../assets/Albemarle EMC Contract.docx'},
				// sedcmbr: '2',file:  'starkimg.png',fileUrl:'assets/starkimg.png'},
				// {applicationname : 'Starkville Utilities Statement',startdate :'02/23/2002',enddate : '02/23/2012',
				// initialterm: '2',renewalterm:'12',terminationnotice: '21',
				// // sedcmbr: '5',file: 'Gary Deep East Texas ECI.jpg',fileUrl:'../../../../assets/bg.jpg'},
				// sedcmbr: '5',file: 'Starkvillestarkimg.jpg',fileUrl:'assets/starkimg.png'},
				// {applicationname : 'Starkville Utilities Delinquent',startdate :'02/23/2004',enddate : '02/23/2014',
				// initialterm: '4',renewalterm:'34',terminationnotice: '33',
				// // sedcmbr: '16',file:  'starkvilleutilities.pdf',fileUrl:'../../../../assets/starkvilleutilities.pdf'},
				// sedcmbr: '16',file:  'starkvilleutilities.pdf',fileUrl:'assets/starkvilleutilities.pdf'},
				// {applicationname : 'Starkville Utilities Renewals',startdate :'02/23/2005',enddate : '02/23/2015',
				// initialterm: '5',renewalterm:'27',terminationnotice: '24',
				// // sedcmbr: '17',file:   'Citizens Electric Corporation.pdf',fileUrl:'../../../../assets/Citizens Electric Corporation.pdf'}
				// sedcmbr: '17',file: 'Starkville.docx',fileUrl:'assets/Starkville.docx'}
			// ];
					// return ok(ServiceAgreements);
			// };
			
			//get all supp. ServiceAgreements
		/* 	if (request.url.endsWith('/Customers/GetAllSupplementaryServiceAgreement/') && request.method === 'GET') {
                
	
				const SupServiceAgreements: supplementaryServiceAgreementModel[] = [
					{id:1,description : 'Description 1',startdate :'05/23/2019',enddate : '02/23/2020',
					file:  'starkimg.png',fileUrl:'assets/starkimg.png'},
					{id:2,description : 'Description 2',startdate :'05/2/2019',enddate : '06/20/2020',
					file: 'Starkvillestarkimg.jpg',fileUrl:'assets/starkimg.png'},
					{id:3,description : 'Description 3',startdate :'08/30/2019',enddate : '10/23/2020',
					file:  'starkvilleutilities.pdf',fileUrl:'assets/starkvilleutilities.pdf'},
					{id:4,description : 'Description 4',startdate :'05/23/2019',enddate : '25/12/2019',
					file: 'Starkville.docx',fileUrl:'assets/Starkville.docx'}
					];
					return ok(SupServiceAgreements);
			}; */

			//serviceagreement Application list for dropdown
			/* if (request.url.endsWith('/Customers/GetAllApplictaionForServiceAgreement/') && request.method === 'GET') {
                
					const Application: ApplicationData[] = [{	
					id:1,	applicationName:'Starkville Utilities',applicationCode:'SEM',
                    statement:' Electric Bills',active:true					
						},
						{	
							id:2,	applicationName:'Starkville Utilities Delinquent',applicationCode:'SEMD',	
						    statement:'Delinquent Notices',active:true
						},
					   {	
						id:3,applicationName:'Starkville Utilities Renewals',applicationCode:'SEMR'	,
						statement:'Renewals',active:true
						},
						{	
						id:4,applicationName:'Starkville Utilities Statement',applicationCode:'SEMS',
                        statement:'Statement',active:true					
						},
	
				]
				return ok(Application);
				};

				if (request.url.endsWith('/Customers/EditApplictaionForServiceAgreement/') && request.method === 'GET') {
                
					const Application: ApplicationData[] = [{	
					id:1,	applicationName:'Starkville Utilities',applicationCode:'SEM',
                    statement:' Electric Bills',active:true					
						},
						{	
							id:2,	applicationName:'Starkville Utilities Delinquent',applicationCode:'SEMD',	
						    statement:'Delinquent Notices',active:true
						},
					   {	
						id:3,applicationName:'Starkville Utilities Renewals',applicationCode:'SEMR'	,
						statement:'Renewals',active:true
						},
						{	
						id:4,applicationName:'Starkville Utilities Statement',applicationCode:'SEMS',
                        statement:'Statement',active:true					
						},
				]
				return ok(Application);
				}; */
		
		//=========================================================================		
			/* 	//inserts data
				if (request.url.endsWith('/Insert/getallInserts/') && request.method === 'GET') {
                
					const Insert: Inserts[] = [
						{
							applicationName:'Starkville Utilities',applicationCode:'SEM',startDate: '12/22/2019',endDate:'12/24/2020',active:false,weight:"100",code:"Code 1",description:"Security",insertType:"Global"
						},
						{
							applicationName:'Starkville Utilities Statement',applicationCode:'SEMS',startDate: '01/22/2017',endDate:'02/24/2019',active:false,weight:"200",code:"Code 2",description:"News letter",insertType:"Selective"
						},
						{
							applicationName:'Starkville Utilities Renewals',applicationCode:'SEMR',startDate: '03/15/2016',endDate:'12/24/2022',active:true,weight:"300",code:"Code 3",description:"Powerlines",insertType:"Global"
						},
						{
							applicationName:'Starkville Utilities Delinquent',applicationCode:'SEMD',startDate: '07/17/2016',endDate:'02/14/2021',active:true,weight:"400",code:"Code 4",description:"Holiday Schedule",insertType:"Selective"
						},
						{
							applicationName:'PenTex Energy CC Check',applicationCode:'CCTR',startDate: '02/12/2016',endDate:'05/10/2018',active:false,weight:"500",code:"Code 5",description:"	Keep Troup Beautiful",insertType:"Global"
						}
					]
					return ok(Insert);
				};	 */

				//=========================================================================		
				
				//Get All Billing Decription
				/* if (request.url.endsWith('/Customers/GetAllBillingRates/') && request.method === 'GET') {
                
					const billingrates: billingrateModal[] = [
						{
					    'id':1,
						'descreption':"Description 1",
						'rating':"113.1000"
					  },{
						'id':2,
						'descreption':"Description 2",
						'rating':"22.0000"
					  },{
						'id':3,
						'descreption':"Description 3",
						'rating':"32.1012"
					  }
				
					]
					return ok(billingrates);
				}; */
				
				
				
			/* 	 // get all AppTypes
				if (request.url.endsWith('/AppType/GetAllApptypes/') && request.method === 'GET') {
                
				const appType: Apptype[] = [
					{ appID: 1, description: 'Annual Meeting Notice.'},
					{ appID: 2, description: 'Delinquent'},
					{ appID: 3, description: 'Letter'},
					{ appID: 4, description: 'Ancillary'},
					{ appID: 5, description: 'App Type'},
					{ appID: 6, description: 'Statements'},
					{ appID: 7, description: 'Business Abstract'},
					{ appID: 8, description: 'Blank Bills'},
					{ appID: 9, description: 'Blank Capital Credit Checks'},
					{ appID: 10, description: 'Capital Credit Checks'},
					{ appID: 11, description: 'Governmental Notice'}
					
					];
				
                return ok(appType);
            }	 */
			
			// get all Fee Descriptions
           /*  if (request.url.endsWith('/FeeDescription/getAllFeeDescriptions/') && request.method === 'GET') {
                
				const feeDescription: Feedescription[] = [
					{ recID: 1, description: ' Non-Automation Fee'},
					{ recID: 2, description: 'FedEx'},
					{ recID: 3, description: 'Implementation Fee'},
					{ recID: 4, description: 'Large Envelope Insertion'},
					{ recID: 5, description: 'Envelope Insertion'},
					{ recID: 6, description: 'Package Insertion'},
					{ recID: 7, description: 'Envelope Cost'},
					{ recID: 8, description: 'Label Cost'},
					{ recID: 9, description: 'Pre-Printed Forms Cost'},
					{ recID: 10, description: 'UPS Charge'},
					{ recID: 11, description: 'Returned Inserts'},
					{ recID: 12, description: 'Services Credit'},
					{ recID: 13, description: 'Postage Credit'},
					{ recID: 14, description: 'Message Service'},
					{ recID: 15, description: 'Insert Processing'},
					];
                return ok(feeDescription);
            }	
			 */
			/* // get all Flags
            if (request.url.endsWith('/Flags/GetAllFlags/') && request.method === 'GET') {
                
				const flag: Flagtype[] = [
					{ flagId: 1, description: 'SEDC'},
					{ flagId:2, description: 'SEDC - No SEDC Software'},
					{ flagId:3, description: 'Arista'},
					{ flagId:4, description: 'Azar'},
					{ flagId:5, description: 'Republic'}];
                return ok(flag);
            }	 */
			
			// get all Perf Patterns
        /*     if (request.url.endsWith('/PerfPattern/GetAllPrefPatterns/') && request.method === 'GET') {
                
				const perfPattern: Perfpatterns[] = [
					{ PerfPatternID: 1, description: 'Bottom: 3 3/16"'},
					{ PerfPatternID:2, description: 'Bottom: 3 1/2"'},
					{ PerfPatternID:3, description: 'Bottom: 3 11/16"'},
					{ PerfPatternID:4, description: 'Top: 3 3/16"'},
					{ PerfPatternID:5, description: 'Top: 3 1/2"'},
					{ PerfPatternID:6, description: 'Multi-Top: 3 1/2"; Bottom: 3 1/2"'},
					{ PerfPatternID:7, description: 'Multi - Top: 3 2/3", Bottom: 3 2/3"'},
					];
                return ok(perfPattern);
            }	
				 */
				
				/* //get all States
				if (request.url.endsWith('/States/GetAllStates/') && request.method === 'GET') {
                
					const states: States[] = [
						{'id':1,'stateCode':'AL','stateName':"Alabama",},
						{'id':2,'stateCode':'AK','stateName':"Alaska",},
						{'id':3,'stateCode':'AZ','stateName':"Arizona",},
						{'id':4,'stateCode':'AR','stateName':"Arkansas",},
						{'id':5,'stateCode':'CA','stateName':"California",},						
						{'id':6,'stateCode':'CO','stateName':"Colorado",},
						{'id':7,'stateCode':'CT','stateName':"Connecticut",},
						{'id':8,'stateCode':'DE','stateName':"Delaware",},						
						{'id':9,'stateCode':'FL','stateName':"Florida",},
						{'id':10,'stateCode':'GA','stateName':"Georgia",},
						
						{'id':11,'stateCode':'HI','stateName':"Hawaii",},
						{'id':12,'stateCode':'ID','stateName':"Idaho",},
						{'id':13,'stateCode':'IL','stateName':"Illinois",},
						{'id':14,'stateCode':'IN','stateName':"Indiana",},
						{'id':15,'stateCode':'IA','stateName':"Iowa",},
						{'id':16,'stateCode':'KS','stateName':"Kansas",},
						{'id':17,'stateCode':'KY','stateName':"Kentucky",},
						{'id':18,'stateCode':'LA','stateName':"Louisiana",},
						{'id':19,'stateCode':'ME','stateName':"Maine",},
						{'id':20,'stateCode':'MD','stateName':"Maryland",},
						
						{'id':21,'stateCode':'MA','stateName':"Massachusetts",},
						{'id':22,'stateCode':'MI','stateName':"Michigan",},
						{'id':23,'stateCode':'MN','stateName':"Minnesota",},
						{'id':24,'stateCode':'MS','stateName':"Mississippi",},
						{'id':25,'stateCode':'MO','stateName':"Missouri",},
						{'id':26,'stateCode':'MT','stateName':"Montana",},
						{'id':27,'stateCode':'NE','stateName':"Nebraska",},
						{'id':28,'stateCode':'NV','stateName':"Nevada",},
						{'id':29,'stateCode':'NH','stateName':"New Hampshire",},
						{'id':30,'stateCode':'NJ','stateName':"New Jersey",},
						
						{'id':31,'stateCode':'NM','stateName':"New Mexico",},
						{'id':32,'stateCode':'NY','stateName':"New York",},
						{'id':33,'stateCode':'NC','stateName':"North Carolina",},
						{'id':34,'stateCode':'ND','stateName':"North Dakota",},
						{'id':35,'stateCode':'OH','stateName':"Ohio",},
						{'id':36,'stateCode':'OK','stateName':"Oklahoma",},
						{'id':37,'stateCode':'OR','stateName':"Oregon",},
						{'id':38,'stateCode':'PA','stateName':"Pennsylvania",},
						{'id':39,'stateCode':'RI','stateName':"Rhode Island",},
						{'id':40,'stateCode':'SC','stateName':"South Carolina",},
						
						{'id':41,'stateCode':'SD','stateName':"South Dakota",},
						{'id':42,'stateCode':'TN','stateName':"Tennessee",},
						{'id':43,'stateCode':'TX','stateName':"Texas",},
						{'id':44,'stateCode':'UT','stateName':"Utah",},
						{'id':45,'stateCode':'VT','stateName':"Vermont",},
						{'id':46,'stateCode':'VA','stateName':"Virginia",},
						{'id':47,'stateCode':'WA','stateName':"Washington",},
						{'id':48,'stateCode':'WV','stateName':"West Virginia",},
						{'id':49,'stateCode':'WI','stateName':"Wisconsin",},
						{'id':50,'stateCode':'WY','stateName':"Wyoming",},
						
						
					]
					return ok(states);
				};
				 */
				
				
				//get all CRates
				/* if (request.url.endsWith('/crates/GetAllRates/') && request.method === 'GET') {
                
					const crates: CRates[] = [
						{'recordID':1,'cName':"Albemarle EMC",'rateIdentifier':200,
						'runType':"Run Type 1",'rateType':'Rate Type 1',
						'pCardRateType':"PCard Rate Type 1",'rate':100.2345,'description':'Description1'},
						{'recordID':2,'cName':"Bartholomew County REMC",'rateIdentifier':330,
						'runType':"Run Type 2",'rateType':'Rate Type 2',
						'pCardRateType':"PCard Rate Type 2",'rate':133.6344,'description':'Description2'},
						{'recordID':3,'cName':"Starkville Utilities",'rateIdentifier':25400,
						'runType':"Run Type 3",'rateType':'Rate Type 3',
						'pCardRateType':"PCard Rate Type 3",'rate':392.7698,'description':'Description3'},
						{'recordID':4,'cName':"PenTex Energy",'rateIdentifier':200,
						'runType':"Run Type 4",'rateType':'Rate Type 4',
						'pCardRateType':"PCard Rate Type 4",'rate':777.0857,'description':'Description4'},
						{'recordID':5,'cName':"Deep East Texas ECI",'rateIdentifier':20450,
						'runType':"Run Type 5",'rateType':'Rate Type 5',
						'pCardRateType':"PCard Rate Type 5",'rate':123.6767,'description':'Description5'},
						
					]
					return ok(crates);
				};
				
				
				//get all PcardRates
				if (request.url.endsWith('/PcardRates/getAllPCardRates/') && request.method === 'GET') {
                
					const pcardrates: Pcardrates[] = [
						{'pCardRateID':1,'rateType':"PCard Rate Type 1",
						'rate':100.2345,'description':"Description1",'displayOrder':1},
						{'pCardRateID':2,'rateType':"PCard Rate Type 2",
						'rate':133.6344,'description':"Description 2",'displayOrder':2},
						{'pCardRateID':3,'rateType':"PCard Rate Type 3",
						'rate':123.7698,'description':"Description 3",'displayOrder':3},
						{'pCardRateID':4,'rateType':"PCard Rate Type 4",
						'rate':777.0857,'description':"Description 4",'displayOrder':4},
						{'pCardRateID':5,'rateType':"PCard Rate Type 5",
						'rate':392.6767,'description':"Description 5",'displayOrder':5},
						
					]
					return ok(pcardrates);
				}; */
				
				
			/* 	//get all PRates
				if (request.url.endsWith('/Prates/getAllPrates/') && request.method === 'GET') {
                
					const pRates: Prates[] = [
						{'pRateID':1,'rateType':"P RateType1",
						'rate':200.0234,'description':"Description1",'displayOrder':1},
						{'pRateID':2,'rateType':"P RateType2",
						'rate':433.0656,'description':"Description2",'displayOrder':2},
						{'pRateID':3,'rateType':"P RateType3",
						'rate':565.6767,'description':"Description3",'displayOrder':3},
						{'pRateID':4,'rateType':"P RateType4",
						'rate':123.3007,'description':"Description4",'displayOrder':4},
						{'pRateID':5,'rateType':"P RateType5",
						'rate':545.4389,'description':"Description5",'displayOrder':5},
						
					]
					return ok(pRates);
				}; */
				
				
			/* 	//get all Groups
				if (request.url.endsWith('/Groups/GetAllGroups/') && request.method === 'GET') {
                
					// const groups: Groups[] = [
						// {'groupID':1,'group':"Group1",
						// 'available':"Yes",'groupCode':"GP12"},
						// {'groupID':2,'group':"Group2",
						// 'available':"No",'groupCode':"GP29"},
						// {'groupID':3,'group':"Group3",
						// 'available':"Yes",'groupCode':"GP34"},
						// {'groupID':4,'group':"Group4",
						// 'available':"No",'groupCode':"GP44"},
						// {'groupID':5,'group':"Group5",
						// 'available':"Yes",'groupCode':"GP56"},
					// ]
					
					const groups: Groups[] = [
						{'groupID':1,'group':"Programming",'available':true,'groupCode':"PG"},
						{'groupID':2,'group':"Quality Control",'available':true,'groupCode':"QC"},
						{'groupID':3,'group':"Networking",'available':true,'groupCode':"NT"},
						{'groupID':4,'group':"Operations",'available':false,'groupCode':"OPS"},
						
					]
					
					return ok(groups);
				}; */
				
				// if (request.url.endsWith('/PostageOrders/GetAllPostageOrder/') && request.method === 'GET')
				// 	{

				// 	const postageOrder: postageOrder[] = [
				// 		{
				// 			id:1,desc: 'Desc 1', order:'1'
				// 		},
				// 		{
				// 			id:2,desc: 'Desc 2', order:'2'
				// 		},
				// 		{
				// 			id:3,desc: 'Desc 3', order:'3'
				// 		},
				// 		{
				// 			id:4,desc: 'Desc 4', order:'4'
				// 		},
				// 		{
				// 			id:5,desc: 'Desc 5', order:'5'
				// 		}
				// 	]
				// 	return ok(postageOrder);
				//    };

			/* 	if (request.url.endsWith('/NonBillableRates/GetAllNonBillbleRates/') && request.method === 'GET')
					{

					const nonbillrates: NonBillableRates[] = [
						{
							id:1,group: 'Programming', rate:'246.8967'
						},
						{
							id:2,group: 'Quality Control', rate:'2389.5678'
						},
						{
							id:3,group: 'Networking', rate:'24.5682'
						},
						{
							id:4,group: 'Operations', rate:'5.1459'
						}
					]
					return ok(nonbillrates);
				   };

				
				 */
				
				
				
				
				
				
            // pass through any requests not handled above
            return next.handle(request);
        }))
        // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
        .pipe(materialize())
        .pipe(delay(500))
        .pipe(dematerialize());

        // private helper functions

        function ok(body) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function unauthorised() {
			console.log("Creating unauthorised response");
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function error(message) {
			console.log("Creating error object with :::"+message);
            return throwError({ status: 400, error: { message } });
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
