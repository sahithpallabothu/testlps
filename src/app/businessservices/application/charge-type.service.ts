import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { ChargeType } from '@/businessclasses/Application/application';

@Injectable({
  providedIn: 'root'
})
export class ChargeTypeService {

  url =  Constants.HOST_URL;
    
  constructor(private http: HttpClient) { }  

  //Get all customer charge types.
  getAllCustomerChargeTypes(applicationID:number): Observable<ChargeType[]> { 
		return this.http.get<ChargeType[]>(this.url + '/CustomerChargeType/GetAllCustomerChargeTypes/'+applicationID);
	}
	
    //To add customer charge type
    AddCustomerChargeType(chargeType:ChargeType):Observable<ChargeType[]>{
		let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) }; 
		return this.http.post<ChargeType[]>(this.url + '/CustomerChargeType/AddCustomerChargeType/', chargeType, httpOptions);
  }
  
  //Delete customer charge Type.
  deleteCustomerChargeTypeByID(chargeTypeID: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/CustomerChargeType/DeleteCustomerChargeType/' +chargeTypeID ,  httpOptions);  
  }  

}
