import { Injectable } from '@angular/core';
import { Constants } from '@/app.constants';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { contact } from '@/businessclasses/Customer/contact';

@Injectable({
	providedIn: 'root'
})

export class ContactService {
	url = Constants.HOST_URL;
	constructor(private http: HttpClient) { }

	//get Contacts.
	getContacts(clientId: number) {
		return this.http.get<any>(this.url + '/Contacts/GetContacts/' + clientId);
	}

	//get Notifications Result.
	getNotificationsResult(contactId: number, clientId: number) {
		return this.http.get<any[]>(this.url + '/Contacts/GetNotificationsResult/' + contactId);
	}

	//get Applications.
	getApplications(clientId: number, ContactID: number) {
		return this.http.get<any[]>(this.url + '/Contacts/GetApplications/' + clientId + '/' + ContactID);
	}

	//create Contact.
	createContact(contactInfo: contact): Observable<contact> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
		return this.http.post<contact>(this.url + '/Contacts/AddContact/', contactInfo, httpOptions);
	}

	//update Contact.
	updateContact(contactInfo: contact): Observable<contact> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
		return this.http.put<contact>(this.url + '/Contacts/UpdateContact/', contactInfo, httpOptions);
	}

	//delete Contact By Id.
	deleteContactById(contactId: number, customerID: number, lastDeleteFlag: number): Observable<any> {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
		return this.http.delete<any>(this.url + '/Contacts/DeleteContact/' + contactId + '/' + customerID + '/' + lastDeleteFlag, httpOptions);
	}
}
