import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Department } from '@/businessclasses/admin/department';  
import { of } from 'rxjs';
import {Constants} from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
	url =  Constants.HOST_URL;
	  constructor(private http: HttpClient) { }
	   getAllDepartments(fromDepartment: boolean): Observable<Department[]> { 
		return this.http.get<Department[]>(this.url + '/Department/GetAllDepartments/' + fromDepartment);
		}
		
		getDepartmentById(appid: number) { 
			// 	return this.http.get<Department>(this.url + '/Department/GetAllDepartments' + appid);  
			} 
			createDepartment(department: Department): Observable<Department> {  
				const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
				return this.http.post<Department>(this.url + '/Department/AddDepartment', department, httpOptions);  
			}  
			updateDepartment(department: Department): Observable<Department> {  
				const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
				return this.http.put<Department>(this.url + '/Department/UpdateDepartment', department, httpOptions); 
			}  
			deleteDepartmenteById(recordID: number): Observable<any> {  
				const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
				return this.http.delete<any>(this.url + '/Department/DeleteDepartment/' + recordID,  httpOptions);  
			}  
}
