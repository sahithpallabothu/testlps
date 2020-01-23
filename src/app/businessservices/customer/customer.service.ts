import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Customer,HeldType } from '@/businessclasses/Customer/customer';

@Injectable({  
    providedIn: 'root'  
  })  
    
export class CustomerService {  
    url =  Constants.HOST_URL; 
    constructor(private http: HttpClient) { }  
	
	//To get all customers.
	getAllCustomers(isCustomer : boolean = false): Observable<Customer[]> { 
		return this.http.get<Customer[]>(this.url + '/Customer/GetCustomers/'+isCustomer);
	}
	
	//To get customer.
	getCustomerById(customerid: number) {
		return this.http.get<Customer>(this.url + '/Customer/GetCustomer/' + customerid);  
	} 

	//To create customer.
	createCustomer(customer:Customer):Observable<Customer[]>{
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) }; 
		return this.http.post<Customer[]>(this.url + '/Customer/AddCustomer/', customer, httpOptions);
	}

	//To update customer.
	updateCustomer(customer:Customer):Observable<Customer[]>{ 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<Customer[]>(this.url + '/Customer/UpdateCustomer/', customer, httpOptions);
	}  

	//To get view customers.
	getViewCustomers(searchObj : any): Observable<Customer[]> { 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
		return this.http.post<Customer[]>(this.url + '/Customer/GetViewCustomers/',searchObj,httpOptions);
	}

	//To get held types.
	getHeldTypes(): Observable<HeldType[]> { 
		return this.http.get<HeldType[]>(this.url + '/Customer/GetHeldTypes');
	}

}
