import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient,HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Reports } from '@/businessclasses/reports/reports';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  url =  Constants.HOST_URL;
    
  constructor(private http: HttpClient) { }  
  //Retrieves data in the reports screen based on the input.
	getApplicationsBasedOnSearch(searchObject:any): Observable<Reports[]>{
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
        return this.http.post<Reports[]>(this.url + '/Reports/GetSearchDetails/',searchObject,httpOptions);
	}
}
