export class ValidateDecimalAndIntegers{

    public static validateDecimals(key :any):boolean{
        let keycode = (key.which) ? key.which : key.keyCode;
		let inputData: string = key.srcElement.value;

		if (inputData.replace(/,/g, '').length < 10) {

			if (inputData.replace(/,/g, '').length == 6 && inputData.indexOf('.') == -1) {
				if (keycode == 46) {

					return true;
				}
				else {
					return false;
				}
			}
			else {
				if ((keycode == 46 && inputData.indexOf('.') == -1)) {
					return true;
				}
				else if (keycode < 48 || keycode > 57) {
					return false;
				}
			}
		}
		else {
			return false;
		}
    }
    public static validateIntegers(key :any): boolean{
        var keycode = (key.which) ? key.which : key.keyCode;
		if ((keycode < 48 || keycode > 57 || key.srcElement.value.replace(/,/g, '').length >= 6) && keycode != 44) {
			return false;
		}
		else {
			return true;
		}
    }
}