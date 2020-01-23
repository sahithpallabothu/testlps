import { TestBed } from '@angular/core/testing';

import { PostageService } from './postage.service';

describe('PostageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostageService = TestBed.get(PostageService);
    expect(service).toBeTruthy();
  });
});
