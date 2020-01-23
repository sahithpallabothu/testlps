import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { ClientServiceAgreement, Contracts, BillingRate, CustomerRate, ContractType, RateType} from '@/businessclasses/Customer/serviceAgreement';
@Injectable({  
    providedIn: 'root'  
  })  
    
export class ServiceAgreementService {  
    url =  Constants.HOST_URL;  
    constructor(private http: HttpClient) { }  

    //To Get Service Agreement.
    getClientServiceAgreement(clientID:number): Observable<any[]> { 
        return this.http.get<any[]>(this.url + '/ServiceAgreement/GetClientServiceAgreement/' +clientID);
    }

	//To create service agreement.
	createServiceAgreement(serviceAgreement:ClientServiceAgreement):Observable<ClientServiceAgreement[]>{
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) }; 
		return this.http.post<ClientServiceAgreement[]>(this.url + '/ServiceAgreement/AddServiceAgreement/', serviceAgreement, httpOptions);
	}

	//To update service agreement.
	updateServiceAgreement(serviceAgreement:ClientServiceAgreement):Observable<ClientServiceAgreement[]>{ 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<ClientServiceAgreement[]>(this.url + '/ServiceAgreement/UpdateServiceAgreement/', serviceAgreement, httpOptions);
    }  

}
