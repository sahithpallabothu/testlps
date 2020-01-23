import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Application } from '@/businessclasses/Application/application';
import { PrintLocation } from '@/businessclasses/Application/location';
import {Config} from '@/businessclasses/Application/config'
import { Notification,NotificationsObject  } from '@/businessclasses/Application/notification';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

    url =  Constants.HOST_URL;
    
    constructor(private http: HttpClient) { }  
	
	
	getAllApplications(): Observable<Application[]> {
		return this.http.get<Application[]>(this.url + '/Application/GetAllApplications/');
	}

	/* //to get the applications based on searc criteria
	getApplicationsBasedOnSearch(searchOption:string,searchField:string){
        return this.http.get<Application[]>(this.url + '/Application/GetApplicationBasedOnSearch/' + searchOption + '/' + searchField);
	} */

	//to get the applications based on searc criteria
	getApplicationsBasedOnSearch(searchObject:any): Observable<Application[]>{
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
        return this.http.post<Application[]>(this.url + '/Application/GetApplicationBasedOnSearch/',searchObject,httpOptions);
	}
	
	
    //To create Application.
	createApplication(application:Application):Observable<Application[]>{
		let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) }; 
		return this.http.post<Application[]>(this.url + '/Application/AddApplication/', application, httpOptions);
	}

	//To update Application.
	updateApplication(application:Application):Observable<Application[]>{ 
		let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<Application[]>(this.url + '/Application/UpdateApplication/', application, httpOptions);
	} 
	
	getApplicationByID(appID:number): Observable<Application[]> { 
		return this.http.get<Application[]>(this.url + '/Application/GetApplicationByID/' + appID);
	}
	getConfigData(): Observable<Config>{
		return this.http.get<Config>(this.url + '/Application/GetConfigData/');
	} 
	//get all locations
	getLocations():Observable<PrintLocation[]>{
		return this.http.get<PrintLocation[]>(this.url + '/Application/GetLocations/');
	}
	//To check if any active application exist or not.
	checkActiveApplicationExist(clientID,applicationID?):Observable<any>{
		return this.http.get<any>(this.url + '/Application/CheckActiveApplicationExist/'+clientID+'/'+applicationID);
	}
	deleteApplicationeById(appid: Number): Observable<any> {  
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.delete<any>(this.url + '/Application/DeleteApplication/' +appid ,  httpOptions);  
	}  
	//application notifications
	
	//get contacts & notifications popup in application screen
	getAllNotifications(clientID, appID): Observable<Notification[]> { 
		return this.http.get<Notification[]>(this.url + '/ApplicationNotifications/GetApplicationContacts/' + clientID +'/'+ appID);
	}

	updateNotifications(notificationInfo:NotificationsObject): Observable<NotificationsObject> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<NotificationsObject>(this.url + '/ApplicationNotifications/AddUpdateApplicationNotifications/', notificationInfo, httpOptions);  
	} 

	

}
