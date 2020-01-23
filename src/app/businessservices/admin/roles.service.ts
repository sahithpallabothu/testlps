import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Role ,privileges } from '@/businessclasses/admin/Role';
import {Constants} from '../../app.constants';

 @Injectable({  
  providedIn: 'root'  
})  
  
export class RoleScreenService {  
  
   url =  Constants.HOST_URL;
  
  constructor(private http: HttpClient) { }  
  
  getAllRoles(fromRoles : boolean): Observable<Role[]> { 
    return this.http.get<Role[]>(this.url + '/Role/GetAllRoles/' + fromRoles);
  }

  getAllScreenprivileges(): Observable<privileges[]> { 
    return this.http.get<privileges[]>(this.url + '/Role/GetAllScreensPrivileges/');
  }
  
  getScreenPrevillegesByRoleById(roleId: number) {
    return this.http.get<privileges[]>(this.url + '/Role/GetAllScreensPrivilegesByRoleId/' + roleId);  
  } 
      
  createRole(role: Role):Observable<Role> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Role>(this.url + '/Role/AddRole/', role, httpOptions);  
  }  

  updateRole(role: Role): Observable<Role> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Role>(this.url + '/Role/UpdateRole/', role, httpOptions); 
  } 

  deleteRoleById(roleId: number): Observable<any> {   
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/Role/DeleteRole/' + roleId,  httpOptions);  
  }  

  async getPrivilegedScreensByUserID(userId: number) { 
    var result = await this.http.get<privileges[]>(this.url + '/Role/GetPrivilegedScreensByUserID/' + userId);
    return result;
  }
 
}  
