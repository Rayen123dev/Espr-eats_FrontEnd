import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonnementConfirmeComponent } from './abonnement-confirme.component';

describe('AbonnementConfirmeComponent', () => {
  let component: AbonnementConfirmeComponent;
  let fixture: ComponentFixture<AbonnementConfirmeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbonnementConfirmeComponent]
    });
    fixture = TestBed.createComponent(AbonnementConfirmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
