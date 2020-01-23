import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewinsertComponent } from './viewinsert.component';

describe('ViewinsertComponent', () => {
  let component: ViewinsertComponent;
  let fixture: ComponentFixture<ViewinsertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewinsertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewinsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
