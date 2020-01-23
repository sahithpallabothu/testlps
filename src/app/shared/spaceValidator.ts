import { FormControl } from '@angular/forms';

export class SpaceValidator 
{   
  public static ValidateSpaces(control: FormControl) 
  {

    let isSpace;
    let isValid;
    if(control.value != null && control.value.length!== 0){
        isSpace = (control.value || '').trim().length === 0;

        let splitted = control.value.split(" "); 
        
        // Start Space
        let firststring = splitted[0];

        // Middle Space

        // End Space
        let laststring = splitted[splitted.length - 1];

        isSpace = firststring.trim().length === 0;
        if(isSpace)
        {
            isValid = !isSpace;
            return isValid ? null : { 'space': true };
        }

        isSpace = laststring.trim().length === 0;

        // let spaces =  splitted.length - 1;
        // isSpace = spaces > 0 ? true : false;

        isValid = !isSpace;
    }
    else
    {
        isValid =true;
    }
    
    return isValid ? null : { 'space': true };
 }



}

