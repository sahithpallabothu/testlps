import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserOptionsComponent } from './browser-options.component';

describe('BrowserOptionsComponent', () => {
  let component: BrowserOptionsComponent;
  let fixture: ComponentFixture<BrowserOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
