import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
 
import { Software } from '@/businessclasses/admin/software';

import {Constants} from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class SoftwareService {

  url =  Constants.HOST_URL;
  
  constructor(private http: HttpClient) { }  

  
  getAllSoftwares(): Observable<Software[]> { 
    return this.http.get<Software[]>(this.url + '/Software/GetAllSoftwares/');
  }

  GetSoftwareById(ratesRecordID: number) {
    return this.http.get<Software>(this.url + '/Software/GetSoftwareById/' + ratesRecordID);  
  } 
  
	createSoftware(rates: Software): Observable<Software> {  
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.post<Software>(this.url + '/Software/AddSoftware/', rates, httpOptions);  
	}  
	
  updateSoftware(rates: Software): Observable<Software> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Software>(this.url + '/Software/UpdateSoftware/', rates, httpOptions); 
  }  
  
  deleteSoftwareById(SoftwareID: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/Software/DeleteSoftware/' + SoftwareID,  httpOptions);  
  }  
}

//npm install jspdf@1.4.1 --save jspdf-autotable