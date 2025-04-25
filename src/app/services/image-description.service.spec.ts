import { TestBed } from '@angular/core/testing';

import { ImageDescriptionService } from './image-description.service';

describe('ImageDescriptionService', () => {
  let service: ImageDescriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageDescriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
