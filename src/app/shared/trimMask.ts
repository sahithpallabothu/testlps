export class TrimMask{
    public static trimMask(InputData:string):string{
       let tempString=InputData.replace('(','').replace(')','').replace('-','').replace(' ','');

        return tempString;
    }
}