import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Configuration } from '../../businessclasses/admin/configuration';  


import {Constants} from '@/app.constants';


@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
	 
	 url =  Constants.HOST_URL;
	
	constructor(private http: HttpClient) { }
  
   getAllCongfigurations(): Observable<Configuration[]> { 
    return this.http.get<Configuration[]>(this.url + '/Configuration/GetAllConfigurations/');
  }  

 
  updateCongfiguration(configuration: Configuration): Observable<Configuration> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Configuration>(this.url + '/Configuration/UpdateConfigurations/', configuration, httpOptions); 
  }  
 
  
}
