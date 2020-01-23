import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatepostageNewComponent } from './updatepostage-new.component';

describe('UpdatepostageNewComponent', () => {
  let component: UpdatepostageNewComponent;
  let fixture: ComponentFixture<UpdatepostageNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatepostageNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatepostageNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
