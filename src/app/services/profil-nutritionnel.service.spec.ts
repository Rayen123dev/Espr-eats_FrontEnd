import { TestBed } from '@angular/core/testing';

import { ProfilNutritionnelService } from './profil-nutritionnel.service';

describe('ProfilNutritionnelService', () => {
  let service: ProfilNutritionnelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfilNutritionnelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
