import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PopupMessageService } from '../shared/popup-message.service';
import { MessageConstants } from '../shared/message-constants';
export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}
@Injectable({
  providedIn: 'root'
})


@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(
    private popupService: PopupMessageService) {
  }
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> | Promise<boolean> {
    return component.canDeactivate() ? true : this.getResponse();
  }
  async getResponse() {
    const userresponse = await this.popupService.openConfirmDialog(MessageConstants.PAGERESETMESSAGE, "help_outline");
    if (userresponse === "ok") {
      return true;
    }
    else {
      return false;
    }
  }

}
