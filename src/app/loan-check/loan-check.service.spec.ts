import { TestBed } from '@angular/core/testing';

import { LoanCheckService } from './loan-check.service';

describe('LoanCheckService', () => {
  let service: LoanCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
