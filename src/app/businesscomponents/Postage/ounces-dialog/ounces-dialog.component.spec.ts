import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OuncesDialogComponent } from './ounces-dialog.component';

describe('OuncesDialogComponent', () => {
  let component: OuncesDialogComponent;
  let fixture: ComponentFixture<OuncesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OuncesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OuncesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
