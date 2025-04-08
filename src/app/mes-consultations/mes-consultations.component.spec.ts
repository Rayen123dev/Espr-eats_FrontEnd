import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesConsultationsComponent } from './mes-consultations.component';

describe('MesConsultationsComponent', () => {
  let component: MesConsultationsComponent;
  let fixture: ComponentFixture<MesConsultationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesConsultationsComponent]
    });
    fixture = TestBed.createComponent(MesConsultationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
