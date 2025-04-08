import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilNutritionnelComponent } from './profil-nutritionnel.component';

describe('ProfilNutritionnelComponent', () => {
  let component: ProfilNutritionnelComponent;
  let fixture: ComponentFixture<ProfilNutritionnelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilNutritionnelComponent]
    });
    fixture = TestBed.createComponent(ProfilNutritionnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
