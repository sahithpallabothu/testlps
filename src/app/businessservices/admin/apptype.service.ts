import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Apptype } from '../../businessclasses/admin/apptype';  
import { of } from 'rxjs';

import {Constants} from '@/app.constants';


@Injectable({
  providedIn: 'root'
})
export class ApptypeService {
	 
	 url =  Constants.HOST_URL;
	
	constructor(private http: HttpClient) { }
  
   getAllApptypes(fromAppType: boolean): Observable<Apptype[]> { 
    return this.http.get<Apptype[]>(this.url + '/AppType/GetAllApptypes/'+fromAppType);
  }  

  getApptypeById(appid: number) {
    return this.http.get<Apptype>(this.url + '/AppType/GetApptypeById/' + appid);  
  } 
  createApptype(apptype: Apptype): Observable<Apptype> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Apptype>(this.url + '/AppType/AddApptype/', apptype, httpOptions);  
  }  
  updateApptype(apptype: Apptype): Observable<Apptype> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Apptype>(this.url + '/AppType/UpdateApptype/', apptype, httpOptions); 
  }  
  deleteApptypeById(appid: string): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/AppType/DeleteApptype/' +appid ,  httpOptions);  
  }  
  
}
