

// currently not used as of March 12 2019
// will be used in the tutorial based on http://jasonwatmore.com/post/2018/10/29/angular-7-user-registration-and-login-example-tutorial
 

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '@/_services';

@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message1 => { 
            this.message = message1; 
			
	 		/*
			 for(var key in this.message) {
		    	var value = (this.message)[key];			 
			 	console.log(key,value);
			 }
			 */
			// if(this.message !== undefined)
			 //console.log("@@@@@@@@@@"+((this.message)['text'])['error']['message']);
			 
			
			// AlertComponent---{"type":"error","text":{"status":400,"error":{"message":"Username or password is incorrect"}}}
			//console.log("AlertComponent---JSON of message: "+JSON.stringify(this.message));
			 
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}