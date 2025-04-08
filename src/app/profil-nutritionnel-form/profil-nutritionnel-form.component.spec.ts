import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilNutritionnelFormComponent } from './profil-nutritionnel-form.component';

describe('ProfilNutritionnelFormComponent', () => {
  let component: ProfilNutritionnelFormComponent;
  let fixture: ComponentFixture<ProfilNutritionnelFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilNutritionnelFormComponent]
    });
    fixture = TestBed.createComponent(ProfilNutritionnelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
