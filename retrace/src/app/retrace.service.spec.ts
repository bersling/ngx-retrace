import { TestBed, inject } from '@angular/core/testing';

import { RetraceService } from './retrace.service';

describe('RetraceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RetraceService]
    });
  });

  it('should be created', inject([RetraceService], (service: RetraceService) => {
    expect(service).toBeTruthy();
  }));
});
