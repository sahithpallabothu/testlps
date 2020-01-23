import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintLocationComponent } from './print-location.component';

describe('PrintLocationComponent', () => {
  let component: PrintLocationComponent;
  let fixture: ComponentFixture<PrintLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
