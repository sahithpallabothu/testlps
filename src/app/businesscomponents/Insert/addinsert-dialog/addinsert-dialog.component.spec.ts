import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddinsertDialogComponent } from './addinsert-dialog.component';

describe('AddinsertDialogComponent', () => {
  let component: AddinsertDialogComponent;
  let fixture: ComponentFixture<AddinsertDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddinsertDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddinsertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
