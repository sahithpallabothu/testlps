import { Injectable } from '@angular/core';
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inserts } from '@/businessclasses/Inserts/Insert';
import { InsertType } from '@/businessclasses/Inserts/Insert-Type';
import { Application } from '@/businessclasses/Application/application'

@Injectable({
  providedIn: 'root'
})
export class InsertService {

  url = Constants.HOST_URL;

  constructor(private http: HttpClient) { }
  getallInsertsByApplicationID(applicationID, startDate, endDate , screenCPLName='insert'): Observable<Inserts[]> {
    if (startDate) {
      startDate = startDate.split('/')
      startDate = startDate.join('-')
    } else {
      startDate = "00-00-00"
    }
    if (endDate) {
      endDate = endDate.split('/')
      endDate = endDate.join('-')
    }
    else {
      endDate = "00-00-00"
    }
    return this.http.get<Inserts[]>(this.url + '/Insert/GetAllInsertsByApplicationID/' + applicationID + '/' + startDate + '/' + endDate + '/' + screenCPLName);
  }
  getallInserts(custName, custCode, startDate, endDate,active): Observable<Inserts[]> {
    if (startDate) {
      startDate = startDate.split('/')
      startDate = startDate.join('-')
    } else {
      startDate = "00-00-00"
    }
    if (endDate) {
      endDate = endDate.split('/')
      endDate = endDate.join('-')
    } else {
      endDate = "00-00-00"
    }
    if (!custCode) {
      custCode = "empty"
    }
    if (!custName) {
      custName = "empty"
    }
    return this.http.get<Inserts[]>(this.url + '/Insert/GetAllInserts/' + custName + '/'
      + custCode + '/' + startDate + '/' + endDate+'/' + active);
  }

  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.url + '/Insert/GetApplicationsForInserts/');
  }

  checkInsertTypeExist(applicationCode, insertType, insertNumber, active, startDate, endDate) {
    if (startDate) {
      startDate = startDate.split('/')
      startDate = startDate.join('-')
    } else {
      startDate = "00-00-00"
    }
    if (endDate) {
      endDate = endDate.split('/')
      endDate = endDate.join('-')
    } else {
      endDate = "00-00-00"
    }
    return this.http.get<boolean>(this.url + '/Insert/checkInsertType/' + applicationCode + '/'
      + insertType + '/' + insertNumber + '/' + active + '/' + startDate + '/' + endDate);
  }
  getallInsertTypes(): Observable<InsertType[]> {
    return this.http.get<InsertType[]>(this.url + '/Insert/GetAllInsertTypes/');
  }
  //To create Insert.
  createInsert(inserts: Inserts[]): Observable<Inserts[]> {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<Inserts[]>(this.url + '/Insert/AddInsert/', inserts, httpOptions);
  }
  //To update Insert.
  updateInsert(inserts: Inserts[]): Observable<Inserts[]> {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put<Inserts[]>(this.url + '/Insert/UpdateInsert/', inserts, httpOptions);
  }

  //To Delete Insert.
  deleteInsertById(RecID: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.delete<any>(this.url + '/Insert/DeleteInsertByID/' + RecID, httpOptions);
  }



}
