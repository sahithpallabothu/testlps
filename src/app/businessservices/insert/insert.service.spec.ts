import { TestBed } from '@angular/core/testing';

import { InsertService } from './insert.service';

describe('InsertService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InsertService = TestBed.get(InsertService);
    expect(service).toBeTruthy();
  });
});
