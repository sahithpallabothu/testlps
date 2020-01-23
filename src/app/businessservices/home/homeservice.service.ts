import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Inserts } from '@/businessclasses/Inserts/Insert'; 
import { Postage } from '@/businessclasses/Postage/postage';   
import { jsonpCallbackContext } from '@angular/common/http/src/module';
import { HomeSearch } from '@/businessclasses/Home/home';

@Injectable({
  providedIn: 'root'
})
export class HomeserviceService {

   url =  Constants.HOST_URL;
    
    constructor(private http: HttpClient) { }  
	  
	//To get Inserts.
	  getInserts(inserts:HomeSearch): Observable<Inserts[]> { 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
		return this.http.post<Inserts[]>(this.url  + '/Home/getInserts/',inserts,httpOptions);
	} 

	 //To get Jobs.
	  getJobs(Jobs:HomeSearch): Observable<Postage[]> { 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
		return this.http.post<Postage[]>(this.url  + '/Home/getJobs/',Jobs,httpOptions);
	  }   

	  //To get Jobs and inserts count.
	  getJobsAndInsertsCount(searchData:HomeSearch): Observable<any> { 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
		return this.http.post<any>(this.url  + '/Home/getJobsAndInsertsCount/',searchData,httpOptions);
	  }   
}
