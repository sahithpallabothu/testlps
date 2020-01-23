import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';  
import {ErrorStateMatcher} from '@angular/material';

export class ErrorMatcher implements ErrorStateMatcher 
{
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean 
    {
		return control.dirty && control.invalid;
    }
}