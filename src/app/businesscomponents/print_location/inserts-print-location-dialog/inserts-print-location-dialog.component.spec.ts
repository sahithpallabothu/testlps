import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertsPrintLocationDialogComponent } from './inserts-print-location-dialog.component';

describe('InsertsPrintLocationDialogComponent', () => {
  let component: InsertsPrintLocationDialogComponent;
  let fixture: ComponentFixture<InsertsPrintLocationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertsPrintLocationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertsPrintLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
