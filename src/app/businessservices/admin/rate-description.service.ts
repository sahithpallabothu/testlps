import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
 
//import { Role } from '@/businessclasses/admin/Role';
import { RateDescription } from '@/businessclasses/admin/rate-description';

import { of } from 'rxjs';
import {Constants} from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class RateDescriptionService {

  url =  Constants.HOST_URL;
  
  constructor(private http: HttpClient) { }  

  
  getAllRateDescriptions(fromRateType: boolean = false): Observable<RateDescription[]> { 
    return this.http.get<RateDescription[]>(this.url + '/RateDescription/GetAllRateDescriptions/'+fromRateType);
  }

  GetRateDescriptionById(ratesRecordID: number) {
    return this.http.get<RateDescription>(this.url + '/RateDescription/GetRateDescriptionById/' + ratesRecordID);  
  } 
  
	createRateDescription(rates: RateDescription): Observable<RateDescription> {  
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.post<RateDescription>(this.url + '/RateDescription/AddRateDescription/', rates, httpOptions);  
	}  
	
  updateRateDescription(rates: RateDescription): Observable<RateDescription> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<RateDescription>(this.url + '/RateDescription/UpdateRateDescription/', rates, httpOptions); 
  }  
  
  deleteRateDescriptionById(rateDescriptionID: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/RateDescription/DeleteRateDescription/' + rateDescriptionID,  httpOptions);  
  }  
}
