import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { ContractType, RateType} from '@/businessclasses/Customer/serviceAgreement';
@Injectable({  
    providedIn: 'root'  
  })  
    
export class ContractService {
  url =  Constants.HOST_URL;   
  constructor(private http: HttpClient) { }  

  //To get Contracts.
  getContracts(clientID:number): Observable<any[]> { 
    return this.http.get<any[]>(this.url + '/ServiceAgreement/GetContracts/' +clientID);
  }

  //To Get Service Agreement.
  getContractTypes(): Observable<ContractType[]> { 
    return this.http.get<ContractType[]>(this.url + '/ServiceAgreement/GetContractTypes/');
  }

  //To Get Service Agreement.
  getRateTypes(): Observable<RateType[]> { 
    return this.http.get<RateType[]>(this.url + '/ServiceAgreement/GetRateTypes/');
  } 
    
	//To save contract agreement.
	saveContractInDB(contracts:any):Observable<any[]>{
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) }; 
		return this.http.post<any[]>(this.url + '/ServiceAgreement/AddContract/', contracts, httpOptions);
	}

	//To update service agreement.
	updateContractInDB(contracts:any):Observable<any[]>{ 
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
		return this.http.put<any[]>(this.url + '/ServiceAgreement/UpdateContract/', contracts, httpOptions);
  }  

  //deleteContractById
  deleteContractById(clientContractID,customerType,clientName,selectedRowFileName): Observable<any> {  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };  
    return this.http.delete<any>(this.url + '/ServiceAgreement/DeleteContract/' +clientContractID+"/"+customerType+"/"+clientName+"/"+selectedRowFileName, httpOptions);  
  } 

  //Get file data
  getFileData(fileName,clientName,customerType): Observable<any>{
    const frmData :FormData = new FormData();  
    frmData.append('fileName', fileName);
    frmData.append('customerName', clientName);
    frmData.append('clientType', customerType);
    return this.http.post<any>(this.url + '/ServiceAgreement/SendBlobData/',frmData);
  }

  //To delete all unsaved files
  deleteUnsavedFiles(filesList,clientName,customerType): Observable<any> { 
    const frmData :FormData = new FormData();  
    for (var i = 0; i < filesList.length; i++) {
        frmData.append('contractDetails', filesList[i]);  
    }
    frmData.append('clientName', clientName);
    frmData.append('customerType', customerType);
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
    return this.http.post<any>(this.url + '/ServiceAgreement/DeleteUnsavedFiles/',frmData);
  }
}
