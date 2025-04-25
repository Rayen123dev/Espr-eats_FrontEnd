import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitHistoriqueComponent } from './produit-historique.component';

describe('ProduitHistoriqueComponent', () => {
  let component: ProduitHistoriqueComponent;
  let fixture: ComponentFixture<ProduitHistoriqueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProduitHistoriqueComponent]
    });
    fixture = TestBed.createComponent(ProduitHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
