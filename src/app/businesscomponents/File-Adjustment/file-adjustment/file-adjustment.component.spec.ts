import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileAdjustmentComponent } from './file-adjustment.component';

describe('FileAdjustmentComponent', () => {
  let component: FileAdjustmentComponent;
  let fixture: ComponentFixture<FileAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
