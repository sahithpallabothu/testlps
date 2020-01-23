import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningSummaryComponent } from './running-summary.component';

describe('RunningSummaryComponent', () => {
  let component: RunningSummaryComponent;
  let fixture: ComponentFixture<RunningSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunningSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
