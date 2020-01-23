import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { AdditionalChargesInfo,GetAdditionalCharges} from '@/businessclasses/additionalcharges/additionalcharges';
import {typeOfCharges} from '@/businessclasses/Postage/postage';


@Injectable({
  providedIn: 'root'
})
export class AdditionalchargesService {
  url =  Constants.HOST_URL;
    
  constructor(private http: HttpClient) { }  


    
  AddUpdateAdditionCharges(addlCharges:AdditionalChargesInfo): Observable<AdditionalChargesInfo> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<AdditionalChargesInfo>(this.url + '/AdditionalCharges/AddAdditionalCharges/', addlCharges, httpOptions);  
  } 

  validateJobNumber(jobNumber:string,  clientCode:string): Observable<any> {
    return this.http.get<any>(this.url + '/AdditionalCharges/validateJobNumber/'+jobNumber+'/'+clientCode);  
  }
  checkDuplicateData(tempObject): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<any>(this.url + '/AdditionalCharges/checkDuplicateData/',tempObject, httpOptions);  
  } 

 
  //to get the addl charges based on searc criteria
	getAllAddlCharges(customerCode:string , clientName:string){
    return this.http.get<GetAdditionalCharges[]>(this.url + '/AdditionalCharges/GetAllAdditionalCharges/' + customerCode+'/'+clientName);
  }
  //to update the addl charge by id from view update screen
  updateAdditionalChargeByID(acDetails: typeOfCharges): Observable<typeOfCharges> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<typeOfCharges>(this.url + '/AdditionalCharges/UpdateAdditionalChargeByID/', acDetails, httpOptions); 
  } 

  //to get the addl charges based on searc criteria
	getAllAddlChargesCount(customerCode:string , clientName:string){
    return this.http.get<any>(this.url + '/AdditionalCharges/GetAllAdditionalChargesCount/' + customerCode+'/'+clientName);
  }
 }
