import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdditionalChargesComponent } from './view-additional-charges.component';

describe('ViewAdditionalChargesComponent', () => {
  let component: ViewAdditionalChargesComponent;
  let fixture: ComponentFixture<ViewAdditionalChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAdditionalChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdditionalChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
