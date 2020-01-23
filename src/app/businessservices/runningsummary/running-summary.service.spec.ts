import { TestBed } from '@angular/core/testing';

import { RunningSummaryService } from './running-summary.service';

describe('RunningSummaryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RunningSummaryService = TestBed.get(RunningSummaryService);
    expect(service).toBeTruthy();
  });
});
