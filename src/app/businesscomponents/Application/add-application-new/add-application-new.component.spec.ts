import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApplicationNewComponent } from './add-application-new.component';

describe('AddApplicationNewComponent', () => {
  let component: AddApplicationNewComponent;
  let fixture: ComponentFixture<AddApplicationNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddApplicationNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddApplicationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
