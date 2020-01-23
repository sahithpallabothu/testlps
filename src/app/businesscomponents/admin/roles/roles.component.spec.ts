import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolescreenComponent } from './roles.component';

describe('RolescreenComponent', () => {
  let component: RolescreenComponent;
  let fixture: ComponentFixture<RolescreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolescreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolescreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
