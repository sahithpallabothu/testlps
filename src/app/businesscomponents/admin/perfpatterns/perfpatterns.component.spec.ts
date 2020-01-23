import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfpatternsComponent } from './perfpatterns.component';

describe('PerfpatternsComponent', () => {
  let component: PerfpatternsComponent;
  let fixture: ComponentFixture<PerfpatternsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerfpatternsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfpatternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
