import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { ClientServiceAgreement, BillingRatesInfo} from '@/businessclasses/Customer/serviceAgreement';
@Injectable({  
    providedIn: 'root'  
  })  
    
export class BillingrateService {
    url =  Constants.HOST_URL;   
	constructor(private http: HttpClient) { }  
	
    //To Get Service Agreement.
    getBillingRates(clientID:number): Observable<any[]> { 
        return this.http.get<any[]>(this.url + '/ServiceAgreement/GetBillingRates/' +clientID);
    }

	//To create service agreement.
	createBillingRate(serviceAgreement:BillingRatesInfo):Observable<BillingRatesInfo[]>{
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) }; 
		return this.http.post<BillingRatesInfo[]>(this.url + '/ServiceAgreement/AddBillingRate/', serviceAgreement, httpOptions);
	}

	//To update service agreement.
	updateServiceAgreement(serviceAgreement:ClientServiceAgreement):Observable<ClientServiceAgreement[]>{ 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<ClientServiceAgreement[]>(this.url + '/ServiceAgreement/UpdateServiceAgreement/', serviceAgreement, httpOptions);
    }  

}
