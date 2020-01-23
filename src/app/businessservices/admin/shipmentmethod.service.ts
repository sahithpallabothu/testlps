import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Shipmentmethod } from '@/businessclasses/admin/shipmentmethod'; 
import {Constants} from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class ShipmentmethodService {
	
	url =  Constants.HOST_URL;
  constructor(private http: HttpClient) { }
  
  getAllShipmentMethods(fromShipment: boolean = false): Observable<Shipmentmethod[]> { 
    return this.http.get<Shipmentmethod[]>(this.url + '/ShipmentMethod/GetShipmentMethod/' +fromShipment);
  }
  
  createShipmentMethod(shipmentmethod: Shipmentmethod): Observable<Shipmentmethod> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.post<Shipmentmethod>(this.url + '/ShipmentMethod/AddShipmentMethod/', shipmentmethod, httpOptions);  
  }

  updateShipmentMethod(shipmentmethod: Shipmentmethod): Observable<Shipmentmethod> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.put<Shipmentmethod>(this.url + '/ShipmentMethod/UpdateShipmentMethod/', shipmentmethod, httpOptions); 
  }

  deleteShipmentMethodById(shipmentmethodID: number): Observable<any> { 
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/ShipmentMethod/DeleteShipmentMethod/' + shipmentmethodID,  httpOptions);  

  }  
}
