import { TestBed } from '@angular/core/testing';

import { AdditionalchargesService } from './additionalcharges.service';

describe('AdditionalchargesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdditionalchargesService = TestBed.get(AdditionalchargesService);
    expect(service).toBeTruthy();
  });
});
