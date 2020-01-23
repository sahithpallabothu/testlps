
export class CustomDateConvertor{

    public static dateConvertor(rawDate){
        var convertedDate ="";
		if(rawDate == null || rawDate == ""){
			convertedDate = rawDate
		}
		else{
			rawDate = new Date(rawDate);
			let month = rawDate.getMonth() + 1 < 10 ? "0" + (rawDate.getMonth() + 1) : rawDate.getMonth() + 1;
			let day = rawDate.getDate() < 10 ? "0" + rawDate.getDate() : rawDate.getDate();
			convertedDate = month + "/" + day + "/" + String(rawDate.getFullYear()).substring(2); 
        }
        return convertedDate;
    }
}