import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { PrintLocation } from '@/businessclasses/printlocation/printLocation';


@Injectable({
  providedIn: 'root'
})
export class ChangePrintLocationService {

    url =  Constants.HOST_URL;
    
    constructor(private http: HttpClient) { }  
	
	//get contacts & notifications popup in application screen
	getAllApplicationsData(isWinsalem:any): Observable<PrintLocation[]> { 
		return this.http.get<PrintLocation[]>(this.url + '/ChangePrintLocation/GetAllApplicationData/' +isWinsalem );
	}

	//update the print location 
	updatePrintLocation(printLocationData:any): Observable<any> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<any>(this.url + '/ChangePrintLocation/UpdateApplicationPrintLocation/', printLocationData, httpOptions);  
	} 





/* 
	getApplicationByID(appID:number): Observable<Application[]> { 
		return this.http.get<Application[]>(this.url + '/Application/GetApplicationByID/' + appID);
	} */
}
