import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewpostagesComponent } from './viewpostages.component';

describe('ViewpostagesComponent', () => {
  let component: ViewpostagesComponent;
  let fixture: ComponentFixture<ViewpostagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewpostagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewpostagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
