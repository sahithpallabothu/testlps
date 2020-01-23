/* import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class EncrDecrService {
private _encrDecrkeys :string = '123456$#@$^@1ERF'; 

  constructor() { }
 
  //The method is use for encrypt the value.
  setEncrypt(value){
    var key = CryptoJS.enc.Utf8.parse(this._encrDecrkeys);
    var iv = CryptoJS.enc.Utf8.parse(this._encrDecrkeys);
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
    {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  //The method is use for decrypt the value.
  getDecrypt(value){
    var key = CryptoJS.enc.Utf8.parse(this._encrDecrkeys);
    var iv = CryptoJS.enc.Utf8.parse(this._encrDecrkeys);
    var decrypted = CryptoJS.AES.decrypt(value, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
} */