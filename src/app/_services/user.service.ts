import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//import { User } from '@/_models';
import { User } from '@/businessclasses/admin/User';

import {Constants} from '@/app.constants';



@Injectable({ providedIn: 'root' })
export class UserService {
	
	 
	
	 url = Constants.HOST_URL;
	
    constructor(private http: HttpClient) { }

    getAll() {
        //return this.http.get<User[]>(`${config.apiUrl}/users`);
			return this.http.get<User[]>(this.url +'/users/GetAllUsers');

		}
		
		
		
		
		
}