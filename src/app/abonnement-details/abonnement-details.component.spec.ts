import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonnementDetailsComponent } from './abonnement-details.component';

describe('AbonnementDetailsComponent', () => {
  let component: AbonnementDetailsComponent;
  let fixture: ComponentFixture<AbonnementDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbonnementDetailsComponent]
    });
    fixture = TestBed.createComponent(AbonnementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
