import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAgreementDialogComponent } from './service-agreement-dialog.component';

describe('ServiceAgreementDialogComponent', () => {
  let component: ServiceAgreementDialogComponent;
  let fixture: ComponentFixture<ServiceAgreementDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceAgreementDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceAgreementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
