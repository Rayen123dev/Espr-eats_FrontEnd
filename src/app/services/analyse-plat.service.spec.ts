import { TestBed } from '@angular/core/testing';

import { AnalysePlatService } from './analyse-plat.service';

describe('AnalysePlatService', () => {
  let service: AnalysePlatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalysePlatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
