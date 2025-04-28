import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonnementReportComponent } from './abonnement-report.component';

describe('AbonnementReportComponent', () => {
  let component: AbonnementReportComponent;
  let fixture: ComponentFixture<AbonnementReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbonnementReportComponent]
    });
    fixture = TestBed.createComponent(AbonnementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
