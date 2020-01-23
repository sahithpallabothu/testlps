import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingRateDialogComponent } from './billing-rate-dialog.component';

describe('BillingRateDialogComponent', () => {
  let component: BillingRateDialogComponent;
  let fixture: ComponentFixture<BillingRateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingRateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingRateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
