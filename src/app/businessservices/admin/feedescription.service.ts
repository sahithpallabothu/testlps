import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Feedescription } from '../../businessclasses/admin/feedescription';  
import { of } from 'rxjs';

import {Constants} from '@/app.constants';


@Injectable({
  providedIn: 'root'
})
export class FeedescriptionService {
  
   url = Constants.HOST_URL;
   
  constructor(private http: HttpClient) { }
  
   getAllFeeDescriptions(fromFeeDesc: boolean = false): Observable<Feedescription[]> { 
    return this.http.get<Feedescription[]>(this.url + '/FeeDescription/getAllFeeDescriptions/' +fromFeeDesc);
  }  

  getFeeDescriptionById(RecID: number): Observable<Feedescription> {  
    return this.http.get<Feedescription>(this.url + '/FeeDescription/getFeeDescriptionById/' + RecID);  
  }  
  createFeeDescription(feeDescription: Feedescription): Observable<Feedescription> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Feedescription>(this.url + '/FeeDescription/AddFeeDescription/', feeDescription, httpOptions);  
  }  
  updateFeeDescription(feeDescription: Feedescription): Observable<Feedescription> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Feedescription>(this.url + '/FeeDescription/UpdateFeeDescription/', feeDescription, httpOptions); 
  }  
  deleteFeeDescriptionById(RecID: number): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/FeeDescription/DeleteFeeDescription/' + RecID ,  httpOptions);  
  }  
  
  
}
