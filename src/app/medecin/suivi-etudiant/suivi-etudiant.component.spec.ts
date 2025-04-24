import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviEtudiantComponent } from './suivi-etudiant.component';

describe('SuiviEtudiantComponent', () => {
  let component: SuiviEtudiantComponent;
  let fixture: ComponentFixture<SuiviEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviEtudiantComponent]
    });
    fixture = TestBed.createComponent(SuiviEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
