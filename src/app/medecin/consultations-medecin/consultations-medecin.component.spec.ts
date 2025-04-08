import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsMedecinComponent } from './consultations-medecin.component';

describe('ConsultationsMedecinComponent', () => {
  let component: ConsultationsMedecinComponent;
  let fixture: ComponentFixture<ConsultationsMedecinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultationsMedecinComponent]
    });
    fixture = TestBed.createComponent(ConsultationsMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
