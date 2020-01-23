// Angular components.
import { Component, OnInit, ViewChild, ElementRef, Inject, QueryList } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog, MatSelect } from "@angular/material";

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';

// Business classes.
import { Contracts, ContractType } from '@/businessclasses/Customer/serviceAgreement';

// Business services.
import { ContractService } from '../../../businessservices/customer/contract.service';
import { UserPrivilegesService } from '@/_services';
import { FileUploadService } from '@//businessservices/customer/fileUpload.service';
import { RateDescriptionService } from '../../../businessservices/admin/rate-description.service';

// Popup messages. 
import { ErrorHandlerService } from '../../../shared/error-handler.service';
import { PopupMessageService } from '../../../shared/popup-message.service';

//Constants
import { ErrorMatcher } from '@/shared/errorMatcher';
import { MessageConstants } from '@/shared/message-constants';
import { Constants } from '@/app.constants';
import { SpaceValidator } from '@/shared/spaceValidator';
import { CustomDateConvertor } from '@/shared/customDateConvertor';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PdfViewerComponent } from '@/pdf-viewer/pdf-viewer.component'

@Component({
  selector: 'app-contract-dialog',
  templateUrl: './contract-dialog.component.html',
  styleUrls: ['./contract-dialog.component.css']
})
export class ContractDialogComponent implements OnInit {

  title: string;
  clientName: string;
  clientCode: string;
  clientID: number;
  customerType: string;
  contractsForm: FormGroup;
  currentContractRecordId: any;
  contractTableColumns: string[] = ['contractType', 'contractDate', 'contract'];
  contractDataSource = new MatTableDataSource<Contracts>();
  fileName: string;
  fileType: string;
  fileExtension: string;
  public base64: string;
  dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/];

  //Screen privilege variables
  hasScreenReadPriviledge: boolean = false;
  hasScreenUpdatePriviledge: boolean = false;
  hasScreenInsertPriviledge: boolean = false;
  hasScreenDeletePriviledge: boolean = false;
  isAllowSave: boolean = false;
  fromHome: boolean = false;
  contractTypes = [];//contract type dropdown
  filteredOptionsContractTypes: Observable<ContractType[]>;
  isChangesExists: boolean = false;
  isContractUpdate: boolean = false;
  isContractDateChanges: boolean = false;
  isFileChangesExists: boolean = false;
  currentContractID = null;
  contractDetailsList: any = [];
  unChangedContractList: any = [];
  //For files
  deletedFiles: any = [];
  newlyAddedFiles: any = [];
  modifiedFiles: any = [];
  serviceAgreementFile: any;
  isContractChangesExists: boolean = false;
  fromContractSave: boolean = false;
  highlightedRows = [];
  isTableHasData = true;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('focusContractDate') focusContractDate: ElementRef;
  @ViewChild('focusContractType') focusContractType: MatSelect;
  isEditCustomer :boolean = false;
  selectedRowFileName: any;

  constructor(
    private dialogRef: MatDialogRef<ContractDialogComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private errorService: ErrorHandlerService,
    private popupService: PopupMessageService,
    private contractService: ContractService,
    private fileUploadService: FileUploadService,
    private datePipe: DatePipe,
    private userPrivilegesService: UserPrivilegesService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.title = data.title;
    this.clientName = data.customerName;
    this.clientCode = data.customerCode;
    this.clientID = data.customerID;
    this.customerType = data.customerType;
    this.fromHome = data.fromHome;

    //Set Customer screen privileges
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenUpdatePriviledge = true;
    }
    if (this.userPrivilegesService.hasUpdateScreenPrivileges(Constants.editCustomerScreenName)) {
			this.hasScreenUpdatePriviledge = true;
			 this.isEditCustomer = true;
		}
    if (this.userPrivilegesService.hasInsertScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenInsertPriviledge = true;
    }
    if (this.userPrivilegesService.hasReadScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenReadPriviledge = true;
    }
    if (this.userPrivilegesService.hasDeleteScreenPrivileges(Constants.customerScreenName)) {
      this.hasScreenDeletePriviledge = true;
    }

    if (this.hasScreenDeletePriviledge && this.hasScreenUpdatePriviledge) {
      this.contractTableColumns = ['contractType', 'contractDate', 'contract', 'delete'];
    }
  }

  ngOnInit() {
    this.contractsForm = this.fb.group({
      // Contract(s)
      contractType: ['', []],
      contractDate: [, [Validators.pattern(/(^(((0)[1-9])|((1)[0-2]))(\/)(((0)[1-9])|([1-2][0-9])|((3)[0-1]))(\/)\d{2}$)/)]],
      contractDateWithPicker: [],
      fileName: [],
      fileExt: [],
      fileMimeType: [],
      fileContent: [],
      chooseFile: ['', []],
    });

    this.loadContractTypes();
    this.loadAllContracts(this.clientID);
    this.setSaveBtnEnable()

    //To sort based on table header.
    this.contractDataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase();
      }
      return data[sortHeaderId];
    };

    // if (this.fromHome) {
    //   this.EnableOrDisableFormControls(false);
    // }
    this.setFocus();
  }

 
  // Used to set the focus for the first field.
  setFocus() {
    setTimeout(() => {    
      if (this.contractsForm.get('contractType').value) {
        this.focusContractDate.nativeElement.focus();
      }
      else{
        this.focusContractType.focus();
      }
    }, 0);
  }

  //To check contract type change or not.
  contractTypeChange() {
    this.isContractChangesExists =  true ;
    this.setFocus();
  }

  //To check form field change or not.
  isContractChange() {
    this.isContractChangesExists = true;
    this.isContractDateChanges = true;
  }

  //To open from other screen, Enable Or Disable Form Controls.
  EnableOrDisableFormControls(isEnable: Boolean = true) {
    for (var control in this.contractsForm.controls) {
      isEnable ? this.contractsForm.controls[control].enable() : this.contractsForm.controls[control].disable();
    }
  }

  //To set Save button enable based on privilage. 
  setSaveBtnEnable() {
    if (this.hasScreenUpdatePriviledge) {
      this.isAllowSave = true;
    } else {
      this.isAllowSave = false;
    }
    this.EnableOrDisableFormControls(this.isAllowSave);
  }

  //To load all contract type descriptions.
  loadContractTypes() {
    this.contractService.getContractTypes().subscribe(results => {
      if (!results) { return };
      this.contractTypes = results;
      this.contractTypes.sort((a, b) => (a.description > b.description) ? 1 : ((b.description > a.description) ? -1 : 0));
    },
      (error) => {
        this.errorService.handleError(error);
      });
  }

  //To load all contracts based on client ID.
  loadAllContracts(clientID: number) {
    this.contractService.getContracts(clientID).subscribe(results => {
      if (!results) { return };
      if (results != null) {
        this.contractDataSource.data = results;
        this.contractDetailsList = results;
        this.isTableHasData = this.contractDataSource.data.length > 0 ? true : false;
      }
    },
      (error) => {
        this.errorService.handleError(error);
      });

      this.contractService.getContracts(clientID).subscribe(results => {
        if (!results) { return };
        if (results != null) {
            this.unChangedContractList = results;
        }
      },
      (error) => {
        this.errorService.handleError(error);
      });
  }

  //on form submit data.
  onFormSubmit() {
    const contractsFormData = this.contractsForm.value;
    if (this.contractsForm.get('contractType').value && this.contractsForm.get('contractDate').value
    && (this.selectedRowFileName || this.fileName)) {
      let temp = this.buildFinalContract();
      this.saveContract(temp);
    }
    else {
      this.popupService.openAlertDialog("Contract Type, Contract Date and File are required.", "Service Agreement", "check_circle", false);
    }
  }

  //To build contact final object.
  buildFinalContract() {
    let temp = {
      clientContractID: 0,
      clientID: this.clientID,
      contractDate: this.contractsForm.get('contractDateWithPicker').value == "" || this.contractsForm.get('contractDateWithPicker').value == "Invalid Date" ? this.contractsForm.get('contractDate').value : this.datePipe.transform(new Date(this.contractsForm.get('contractDateWithPicker').value), 'MM/dd/yyyy').toString(),
      contractType: this.contractsForm.get('contractType').value.contractTypeID,
      contractTypeDesc: this.contractsForm.get('contractType').value.description,
      contract: this.fileName,
      deletedFiles: this.deletedFiles,
      modifiedFiles: this.modifiedFiles,
      clientName: this.clientName,
      oldFiles: this.oldFiles,
      customerType: this.customerType
    }
    return temp;
  }

  //To save contract Details.
  oldFiles = [];
  async saveContract(contractsFormData) {
    if (this.contractsForm.get('contractType').value && this.contractsForm.get('contractDate').value
      && (this.selectedRowFileName || this.fileName)) {
      if (this.contractsForm.get('contractDate').value && (this.contractsForm.get('contractDateWithPicker').value != "" && this.contractsForm.get('contractDateWithPicker').value != "Invalid Date")) {
        if (this.checkDuplicateContract(true)){
          if(this.fileExtValidate(this.fileExtension)) {
            if (!this.isContractUpdate) {
              this.saveFileInNetworkPath(contractsFormData);
            }
            else {
              if (this.checkForFileAlreadyExist()) {
                const userresponse = await this.popupService.openConfirmDialog("Are you sure you want to update the existing file?", "help_outline", false);
                if (userresponse === "ok") {
                  this.saveFileInNetworkPath(contractsFormData);
                }
              } else {
                this.saveFileInNetworkPath(contractsFormData);
              }
            }
          }
        } else {
          this.popupService.openAlertDialog("Contract Type already exists.", "Service Agreement", "check_circle", false);
        }
      } else {
        this.popupService.openAlertDialog("Please enter valid Contract Date.", "Service Agreement", "check_circle", false);
      }
    }
    else {
      this.popupService.openAlertDialog("Contract Type, Contract Date and File are required.", "Service Agreement", "check_circle", false);
    }
  }

  //To Save file in network path.
  async saveFileInNetworkPath(contractsFormData) {
    //if(this.fileExtValidate(this.fileExtension)){
      if (this.serviceAgreementFile && this.serviceAgreementFile != '') {
        await this.fileUploadService.uploadIFormFile(this.serviceAgreementFile, this.clientName, this.customerType).subscribe(res => {
          if (res.message === 'File saved.') {
            this.saveContractData(contractsFormData);
          } else if (res.message === 'File already exist.') {
              this.popupService.openAlertDialog("File with same name exists for this Customer.\n Please choose a different file.", "Service Agreement", "check_circle", true);
          }
        },
        (error) => {
          this.errorService.handleError(error);
        });
      } else {
        this.saveContractData(contractsFormData);
      }
    //}
  }

  //To check contract is save or update. 
  async saveContractData(contractsFormData) {  
    contractsFormData.contract = this.fileName;
    if (!this.isContractUpdate) {
      this.saveContractInDB(contractsFormData);
    }
    else {
      if(this.isContractUpdate && this.checkDuplicateContract(true) && 
        this.isContractChangesExists){
        if (this.selectedRowFileName!=this.fileName) {
          let index = this.contractDetailsList.findIndex(x => x.contract === this.selectedRowFileName);
          await this.previousFiles(this.contractDetailsList[index]);
          this.newlyAddedFiles.push(this.serviceAgreementFile);
          this.oldFiles.push(this.selectedRowFileName);
          this.updateContractInDB(contractsFormData);
        }
        else {
          this.updateContractInDB(contractsFormData);
        }
      }
      else {
        this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Contracts", "check_circle", false);
      }
    }
  }

  //To save contract in DB.
  saveContractInDB(contractObject) {
    this.contractService.saveContractInDB(contractObject).subscribe(res => {
      this.popupService.openAlertDialog(MessageConstants.SAVEMESSAGE, "Contracts", "check_circle", false);
      this.resetChangesInContracts();
      this.deletedFiles = [];
      this.newlyAddedFiles = [];
      this.modifiedFiles = [];
      this.oldFiles = [];
      this.loadAllContracts(this.clientID);
    },
      (error) => {
        this.errorService.handleError(error);
      });
  }

  //To update contract in DB.
  updateContractInDB(contractObject) {
    contractObject.clientContractID = this.currentContractID;
    this.contractService.updateContractInDB(contractObject).subscribe(res => {
      this.popupService.openAlertDialog(MessageConstants.UPDATEMESSAGE, "Contracts", "check_circle", false);
      this.resetChangesInContracts();
      this.deletedFiles = [];
      this.newlyAddedFiles = [];
      this.modifiedFiles = [];
      this.oldFiles = [];
      this.loadAllContracts(this.clientID);
    },
      (error) => {
        this.errorService.handleError(error);
      });
  }

  //previous Files.
  async previousFiles(rowData) {
    if (this.modifiedFiles.length > 0) {
      let index = this.modifiedFiles.findIndex(x => x.contract == rowData.contract);
      if (index == -1) {
        this.modifiedFiles.push(rowData);
      }
    } else {
      this.modifiedFiles.push(rowData);
    }
  }

  currentRow = [];
  //Check whether the file is already added or not
  checkForFileAlreadyExist(): boolean {
    for (var i = 0; i < this.contractDetailsList.length; i++) {
      if (this.contractDetailsList[i].clientContractID == this.currentContractID) {
        if (this.fileName != this.contractDetailsList[i].contract) {
          this.currentRow = this.contractDetailsList[i];
          return true;
        }
      }
    }
    return false;
  }


  //To clear the contract form.
  resetChangesInContracts(resetFlag:boolean=false) {
    this.contractsForm.controls['contractType'].setValue('');
    this.contractsForm.controls['contractDate'].setValue(null);
    this.contractsForm.controls['contractDateWithPicker'].setValue(null);
    this.isContractUpdate = false;
    this.highlightedRows.pop();
    this.fileType = '';
    this.fileName = '';
    this.fileExtension = '';
    this.base64 = '';
    this.contractsForm.controls['chooseFile'].setValue('');
    this.serviceAgreementFile = '';
    this.selectedRowFileName = '';
    this.isContractChangesExists = false;
    this.isContractDateChanges = false;
    this.isFileChangesExists = false;
    this.fromContractSave = false;
    this.currentContractID = null;
    if(!resetFlag){
      this.setFocus();
    }    
  }


  //To reset contract form.
  async resetContract() {
    if((this.checkDuplicateContract(false) || this.isFileChangesExists) && this.isContractChangesExists) {
      let response = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (response === "ok") {
        this.isContractChangesExists = false;
        this.resetChangesInContracts();
      }
    } else {
      this.resetChangesInContracts();
    }
  }

   //To close contract dialog.
  async dialogClose() {
      if ((this.checkDuplicateContract(false) || this.isFileChangesExists) && this.isContractChangesExists) {
        const response = await this.popupService.openConfirmDialog(MessageConstants.DIALOGCLOSE, "help_outline");
        if (response === "ok") {
          this.dialogRef.close("cancel");
        }
      } else {
        this.dialogRef.close("cancel");
      }
  }


  //To check duplicate contract type.
  checkDuplicateContract(resetOrSaveContract: boolean) {
    let contractFlag = true;
    for (let cnt of this.unChangedContractList) {
      cnt.contractDate = this.datePipe.transform(cnt.contractDate, MessageConstants.DATEFORMAT);   
      if (!this.isContractUpdate || this.currentContractID==null) {
        if (resetOrSaveContract && cnt.contractTypeDesc === this.contractsForm.get('contractType').value.description) {
          contractFlag = false;
          break
        }
        else {
          if (!resetOrSaveContract && (this.contractsForm.get('contractType').value=="" || 
           this.contractsForm.get('contractType').value == null ) && !this.isContractDateChanges) {
            contractFlag = false;
            break
          }
          else{
            if(this.isContractDateChanges && (this.contractsForm.get('contractDate').value ==="" ||
             this.contractsForm.get('contractDate').value===null )){
              contractFlag = false;
              break
            }
          }       
        }
      } else {
        if (resetOrSaveContract && cnt.contractTypeDesc == this.contractsForm.get('contractType').value.description && cnt.clientContractID !== this.currentContractID) {
          contractFlag = false;
          break
        }
        else {
          if (resetOrSaveContract && cnt.contractTypeDesc === this.contractsForm.get('contractType').value.description
            && cnt.contractDate === this.contractsForm.get('contractDate').value &&
            cnt.contract === this.fileName && this.selectedRowFileName === this.fileName) {
            //this.popupService.openAlertDialog(MessageConstants.NOCHANGESMESSAGE, "Service Agreement", "check_circle", false);
            //contractFlag = false;
            break;
          }       
          else if (!resetOrSaveContract && this.contractsForm.get('contractType').value!=undefined && (cnt.contractTypeDesc === this.contractsForm.get('contractType').value.description
            && cnt.contractDate === this.contractsForm.get('contractDate').value &&
            cnt.contract === this.fileName)) {
            contractFlag = false;
          }
        }
      }
    }
    return contractFlag;
  }


  
  //To populate data for edit agreement.
  populateContractData(row: any) {
    this.resetChangesInContracts(true);
    this.highlightedRows.pop();
    this.highlightedRows.push(row);
    this.isContractUpdate = true;
    this.currentContractID = row.clientContractID;
    this.fileName = row.contract;
    this.selectedRowFileName = row.contract;
    this.contractsForm.controls['contractDate'].setValue(this.datePipe.transform(new Date(row.contractDate), MessageConstants.DATEFORMAT).toString());
    this.contractsForm.controls['contractDateWithPicker'].setValue(new Date(row.contractDate));
    this.contractTypes.forEach(item => {
      if (item.contractTypeID == +row.contractType) {
        this.contractsForm.controls['contractType'].setValue(item);
      }
    });
  }

  //to show color of selected row and load into text fields.
  async selectContractRow(row) {
    if (this.isContractChangesExists) {
      let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline");
      if (resetResponse === "ok") {
        this.populateContractData(row);
        this.isContractChangesExists = false;
      }
    } else {
      this.populateContractData(row);
    }
  }

  //To select file. 
  preview(files: any) {
    if (files.length === 0)
      return;
    this.isFileChangesExists = true;
    target: EventTarget;
    var reader = new FileReader();
    this.fileType = files[0].type;
    this.fileName = files[0].name;
    this.fileExtension = this.fileName.substr((~-this.fileName.lastIndexOf(".") >>> 0) + 2);
    reader.onload = (_event: any) => {
      this.base64 = _event.target.result
    }
    reader.readAsDataURL(files[0]);
    if (this.fileExtValidate(this.fileExtension) && this.fileSizeValidate(this.base64)) {
      this.serviceAgreementFile = files[0];
    }
  }

  //To open file.
  async openPreviewPopUp(row: any) {
    let filename = row.contract;
    var extension = row.contract.split('.')[1];
    await this.contractService.getFileData(filename, this.clientName, this.customerType).subscribe(res => {
      if (res != 'File Data found') {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.maxWidth = "80vw";
        dialogConfig.maxHeight = "50vw";
        dialogConfig.data = {
          title: row.contractTypeDesc,
          fileData: res,
          fileName : filename
        };
        const dialogRef = this.dialog.open(PdfViewerComponent, dialogConfig);
      }
    },
      (error) => {
        this.errorService.handleError(error);
      })
  }

  OpenFilePopup(fileUrl, filename, extension) {
    let w = 800, h = 600
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    var htmlText = "", openWindowFlag = false;
    if (extension.toLowerCase() === 'pdf') {
      htmlText = '<embed width=100% height=100%'
        + ' type="application/pdf"'
        + ' src="data:application/pdf;base64,' + fileUrl + '"></embed>';
      openWindowFlag = true;
    } else if (extension.toLowerCase() == 'txt') {
      htmlText = '<embed width=100% height=100%'
        + ' type="text/plain"'
        + ' src="data:text/plain;base64,' + encodeURI(fileUrl) + '"></embed>';
      openWindowFlag = true;
    } else if (extension.toLowerCase() == 'gif' || extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'jpg' || extension.toLowerCase() == 'png') {
      if (extension.toLowerCase() == 'png')
        htmlText = '<img src="data:image/png;base64,' + fileUrl + '"  alt="Unable to display" />';
      else if (extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'jpg')
        htmlText = '<img src="data:image/jpeg;base64,' + fileUrl + '"  alt="Unable to display" />';
      else if (extension.toLowerCase() == 'gif')
        htmlText = '<img src="data:image/gif;base64,' + fileUrl + '"  alt="Unable to display" />';
      openWindowFlag = true;
    } else {
      htmlText += '<a href="data:application/octet-stream;base64,' + fileUrl + '" download="' + filename + '.' + extension + '">Download</a>';
      openWindowFlag = true;
    }
    if (openWindowFlag) {
      var newWindow = window.open('', 'Uploaded File', 'width=700,height=500,resizable=0,top=150,left=400,toolbar=no,menubar=no');
      newWindow.document.open();
      newWindow.document.write(htmlText)
    }
  }


  // function for  validate file extension
  validExt = ".pdf";
  fileExtValidate(fExt: any) {
    var pos = this.validExt.indexOf(fExt.toLowerCase());
    if (pos < 0) {
      this.popupService.openAlertDialog("Please upload pdf files.", "Service Agreement", "check_circle", false);
      this.contractsForm.controls['chooseFile'].setValue('');
      return false;
    } else {
      return true;
    }
  }

  //function for validate file size 
  //5242880 = 5MB DATA
  maxSize = 5120;
  fileSizeValidate(fdata: any) {
    let fsize = fdata / 1024;
    if (fsize > this.maxSize) {
      this.popupService.openAlertDialog('Maximum file size exceed, Upload file size is: ' + 5 + "MB", "Service Agreement", "check_circle", false);
      this.contractsForm.controls['chooseFile'].setValue('');
      return false;
    } else {
      return true;
    }
  }

  //To delete Agreement.
  agIndex: number;
  async deleteAgreement(clientContract: any) {
    console.log(clientContract);
    if(this.checkDuplicateContract(false)){
			let resetResponse = await this.popupService.openConfirmDialog(MessageConstants.RESETMESSAGE, "help_outline", true);
			if (resetResponse === "ok") {      
        this.resetChangesInContracts();
				this.deleteSelectedAgreement(clientContract);				
			}
		}
		else{
			this.deleteSelectedAgreement(clientContract);	
    }   
  }

  async deleteSelectedAgreement(clientContract:any){
    let clientContractID =  clientContract.clientContractID;
    this.selectedRowFileName = clientContract.contract;
    const userresponse = await this.popupService.openConfirmDialog("Are you sure you want to delete this record?", "help_outline", false);
    if (userresponse === "ok") {
      this.agIndex = this.contractDetailsList.findIndex(function (item: any) {
        return item.clientContractID === clientContractID;
      });
      this.deletedFiles.push(this.contractDetailsList[this.agIndex]);
      let temp = this.buildFinalContract();
      temp.clientContractID = clientContractID;
      this.contractService.deleteContractById(clientContractID, this.customerType, this.clientName, this.selectedRowFileName).subscribe(res => {
        if (res != null) {
          this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Contracts", "check_circle", false);
          this.resetChangesInContracts();
          this.loadAllContracts(this.clientID);
        }
      }, (error) => {
        this.errorService.handleError(error);
      });
    }
  }

  async deleteNetWorkLocationFile() {
    await this.contractService.deleteUnsavedFiles(this.deletedFiles, this.clientName, this.customerType).subscribe(res => {
      this.popupService.openAlertDialog(MessageConstants.DELETEMESSAGE, "Contracts", "check_circle", false);
      this.resetChangesInContracts();
      this.loadAllContracts(this.clientID);
    }, (error) => {
      this.errorService.handleError(error);
    });
  }

  //To check mat-errors.
  public hasError = (controlName: string, errorName: string) => {
    return this.contractsForm.controls[controlName].hasError(errorName);
  }


  contractDateEvent() {
    this.isContractChangesExists = true;
    this.isContractDateChanges = true;
    var todaysDate = new Date(this.contractsForm.controls['contractDateWithPicker'].value);
    let currentDate = this.datePipe.transform(todaysDate, MessageConstants.DATEFORMAT).toString();
    this.contractsForm.controls['contractDate'].setValue(currentDate);
  }

  //Set end date to datepicker.
  setDateInDatePicker(controlName1, controlName2) {
    this.isContractChangesExists = true;
    this.isContractDateChanges = true;
    let dateToSet: any = new Date(this.contractsForm.controls[controlName1].value);
    if (dateToSet == "Invalid Date" || this.contractsForm.controls[controlName1].value == null || this.contractsForm.controls[controlName1].value == "") {
      this.contractsForm.controls[controlName2].setValue("");
    }
    else {   
      this.contractsForm.controls[controlName2].setValue(dateToSet);
      this.contractsForm.controls[controlName1].setValue(this.datePipe.transform(dateToSet, MessageConstants.DATEFORMAT));
    }
  }

  convertDate(cDate){
    return  CustomDateConvertor.dateConvertor(cDate);
  }

}

