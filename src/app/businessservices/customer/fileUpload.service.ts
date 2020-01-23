import { Injectable } from '@angular/core'; 
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';  
import { HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { ServiceAgreementFile } from '@/businessclasses/Customer/serviceAgreementFile'; 

@Injectable({  
    providedIn: 'root'  
  }) 

export class FileUploadService {  
    url =  Constants.HOST_URL;   
    constructor(private http: HttpClient) { }  

  uploadIFormFile(serviceAgreementFile : File,clientName,customerType): Observable<any>   {
    const frmData :FormData = new FormData();  
    frmData.append('file', serviceAgreementFile);  
    frmData.append('clientName', clientName);
    frmData.append('customerType', customerType);
    return  this.http.post<any>(this.url + '/ServiceAgreement/UploadFile/',frmData);       
  }
}
