import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Runningsummary } from '@/businessclasses/runningsummary/runningsummary';


@Injectable({
  providedIn: 'root'
})
export class RunningSummaryService {
  url =  Constants.HOST_URL;
    
    constructor(private http: HttpClient) { }  
	
	//get all job details 
	getAllJobDetailsData(rundate, isPrintWinsalem, isAutoRun, postflag, trip ): Observable<Runningsummary[]> { 
		return this.http.get<Runningsummary[]>(this.url + '/RunningSummary/GetAllJobDetails/'+rundate+"/"+isPrintWinsalem+"/"+isAutoRun+"/"+postflag+"/"+trip );
	}

	//update post flag in db
	updateJobPostFlag(jobData:any): Observable<any> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<any>(this.url + '/RunningSummary/UpdateJobPostFlag/', jobData, httpOptions);  
	} 


}
