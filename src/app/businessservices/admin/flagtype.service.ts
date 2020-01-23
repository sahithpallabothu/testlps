import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http'; 
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Flagtype } from '../../businessclasses/admin/flagtype';  
import { of } from 'rxjs';
import {Constants} from '../../app.constants';

 @Injectable({  
  providedIn: 'root'  
})  
  
export class FlagtypeService {  
  
   url =  Constants.HOST_URL;
  
  constructor(private http: HttpClient) { }  


  getAllFlagtypes(fromFlag: boolean): Observable<Flagtype[]> { 
    return this.http.get<Flagtype[]>(this.url + '/Flags/GetAllFlags/'+fromFlag);
  }  

  getFlagtypeById(id: number) {  
    return this.http.get<Flagtype>(this.url + '/Flags/GetFlagTypeById/' + id);  
  } 
  createFlagtype(flagtype: Flagtype): Observable<Flagtype> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Flagtype>(this.url + '/Flags/AddFlag/', flagtype, httpOptions);  
  }  
  updateFlagtype(flagtype: Flagtype): Observable<Flagtype> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Flagtype>(this.url + '/Flags/UpdateFlag/', flagtype, httpOptions); 
  }  
  deleteFlagtypeById(flagid: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/Flags/DeleteFlag/' +flagid ,  httpOptions);  
  }  
}  