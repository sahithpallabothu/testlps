import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesDialogComponent } from './charges-dialog.component';

describe('ChargesDialogComponent', () => {
  let component: ChargesDialogComponent;
  let fixture: ComponentFixture<ChargesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
