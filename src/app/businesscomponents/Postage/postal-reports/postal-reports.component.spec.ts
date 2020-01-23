import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostalReportsComponent } from './postal-reports.component';

describe('PostalReportsComponent', () => {
  let component: PostalReportsComponent;
  let fixture: ComponentFixture<PostalReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostalReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostalReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
