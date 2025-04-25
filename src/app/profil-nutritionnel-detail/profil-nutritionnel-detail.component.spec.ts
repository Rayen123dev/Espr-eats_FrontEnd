import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilNutritionnelDetailComponent } from './profil-nutritionnel-detail.component';

describe('ProfilNutritionnelDetailComponent', () => {
  let component: ProfilNutritionnelDetailComponent;
  let fixture: ComponentFixture<ProfilNutritionnelDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilNutritionnelDetailComponent]
    });
    fixture = TestBed.createComponent(ProfilNutritionnelDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
