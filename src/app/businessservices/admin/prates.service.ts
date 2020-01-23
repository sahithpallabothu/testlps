import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  

import { of } from 'rxjs';
import {Constants} from '../../app.constants';
import { Prates } from '@/businessclasses/admin/prates'; 

@Injectable({
  providedIn: 'root'
})
export class PratesService {
 url =  Constants.HOST_URL;
   constructor(private http: HttpClient) { }  
  getAllPrates(): Observable<Prates[]> { 
    return this.http.get<Prates[]>(this.url + '/PRates/GetPRates/');
  }

  getPrateById(Id: number) {
    return this.http.get<Prates>(this.url + '/PRates/getPrateById/' +Id);  
  } 
  createPrate(pRate: Prates): Observable<Prates> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Prates>(this.url + '/PRates/AddPRate/', pRate, httpOptions);  
  }  
  updatePrates(pRate: Prates): Observable<Prates> {  
    console.log(pRate,'service')
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Prates>(this.url + '/PRates/UpdatePRates/', pRate, httpOptions); 
  }  
  deletePrate(Prateid: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/PRates/DeletePRate/' + Prateid, httpOptions);  
  } 
}
