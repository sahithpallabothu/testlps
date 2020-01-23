import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeldaddressDialogComponent } from './heldaddress-dialog.component';

describe('HeldaddressDialogComponent', () => {
  let component: HeldaddressDialogComponent;
  let fixture: ComponentFixture<HeldaddressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeldaddressDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeldaddressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
