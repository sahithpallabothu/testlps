import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { States } from '../../businessclasses/admin/states';  

import { of } from 'rxjs';

import {Constants} from '@/app.constants';

@Injectable({
  providedIn: 'root'
})
export class StatesService {
 
 url =  Constants.HOST_URL;
  constructor(private http: HttpClient) { }
  
  getAllStates(fromStates: boolean = false): Observable<States[]> { 
    return this.http.get<States[]>(this.url + '/States/GetAllStates/' +fromStates);
  }  

  getStateById(id: number) { 
    return this.http.get<States>(this.url + '/States/GetstateById/' + id);  
  } 
  createState(state: States): Observable<States> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<States>(this.url + '/States/AddState/', state, httpOptions);  
  }  
  updateState(state: States): Observable<States> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<States>(this.url + '/States/UpdateState/', state, httpOptions); 
  }  
  deleteState(id: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/States/DeleteState/' + id, httpOptions);  
  }  
}
