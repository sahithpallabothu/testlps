import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Perfpatterns } from '../../businessclasses/admin/perfpatterns';  
import { of } from 'rxjs';

import {Constants} from '@/app.constants';


@Injectable({
  providedIn: 'root'
})
export class PerfpatternsService {

	  url = Constants.HOST_URL;
  
	constructor(private http: HttpClient) { }
   
	getAllPerfPatterns(fromPerPattern: boolean): Observable<Perfpatterns[]> {
		return this.http.get<Perfpatterns[]>(this.url + '/PerfPattern/GetAllPerfPatterns/'+fromPerPattern);
	}  

	getPerfPatternById(perfPattern: number) {  
		return this.http.get<Perfpatterns>(this.url + '/PerfPattern/GetPerfPatternById/' + perfPattern);  
	} 

	createPerfPattern(prefPatternType: Perfpatterns): Observable<Perfpatterns> {  
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.post<Perfpatterns>(this.url + '/PerfPattern/AddPerfPattern/', prefPatternType, httpOptions);  
	}  
	
	updatePerfPatternType(prefPatternType: Perfpatterns): Observable<Perfpatterns> {  
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<Perfpatterns>(this.url + '/PerfPattern/UpdatePerfPattern/', prefPatternType, httpOptions); 
	}  
	
	deletePerfPatternType(perfPattern: number): Observable<any> {  
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		var result=this.http.delete<any>(this.url + '/PerfPattern/DeletePerfPattern/' + perfPattern, httpOptions);  
		return result;
	}
}
