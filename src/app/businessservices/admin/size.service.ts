import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Size } from '@/businessclasses/admin/size'; 
import { of } from 'rxjs';
import {Constants} from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class SizeService {

 url =  Constants.HOST_URL;
  constructor(private http: HttpClient) { }
  
  getAllSize(fromSize:boolean): Observable<Size[]> { 
    return this.http.get<Size[]>(this.url + '/Size/getAllSizes/'+fromSize);
  }
  createSize(size: Size): Observable<Size> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Size>(this.url + '/Size/AddSize/', size, httpOptions);  
  }

  updateSize(size: Size): Observable<Size> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Size>(this.url + '/Size/UpdateSize/', size, httpOptions); 
  }

  deleteSizeById(sizeID: number): Observable<any> { 
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/Size/DeleteSize/' + sizeID,  httpOptions);  

  }  
}
