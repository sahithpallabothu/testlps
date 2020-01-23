import { Injectable } from '@angular/core';
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Postage, typeOfCharges, Comments } from '@/businessclasses/Postage/postage';

@Injectable({
	providedIn: 'root'
})
export class PostageService {

	url = Constants.HOST_URL;

	constructor(private http: HttpClient) { }

	getPostageByJob(jobName: string, runDate: string, recordId: number): Observable<Postage[]> {
		const frmData: FormData = new FormData();
		frmData.append('jobNumber', jobName);
		frmData.append('runDate', runDate);
		frmData.append('recordId', recordId.toString());
		return this.http.post<Postage[]>(this.url + '/Postage/getPostageByJob/', frmData);
	}
	updateJobDetail(jobDetailObject: Postage): Observable<Postage[]> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
		return this.http.put<Postage[]>(this.url + '/Postage/updateJobDetail/', jobDetailObject, httpOptions);
	}

}
