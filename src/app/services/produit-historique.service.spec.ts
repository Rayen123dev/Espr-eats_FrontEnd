import { TestBed } from '@angular/core/testing';

import { ProduitHistoriqueService } from './produit-historique.service';

describe('ProduitHistoriqueService', () => {
  let service: ProduitHistoriqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProduitHistoriqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
