import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) data, ) {
    this.FileData ="data:text/plain;base64,"+ data.fileData;
    this.title=data.title;

    this.FileData =  this.base64ToArrayBuffer(data.fileData);
    //var pathArray = (data.path).split('/');

    this.nameOfDownloadedFile = data.fileName;
  }
  private base64ToArrayBuffer(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  title:string;
  FileData: any;
  nameOfDownloadedFile : string;
  ngOnInit() {
  }
  closeViewer() {
    this.dialogRef.close("cancel");
  }
}

