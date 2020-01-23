import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PratesComponent } from './prates.component';

describe('PratesComponent', () => {
  let component: PratesComponent;
  let fixture: ComponentFixture<PratesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PratesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PratesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
