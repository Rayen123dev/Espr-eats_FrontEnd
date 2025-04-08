import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterMedecinComponent } from './consulter-medecin.component';

describe('ConsulterMedecinComponent', () => {
  let component: ConsulterMedecinComponent;
  let fixture: ComponentFixture<ConsulterMedecinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsulterMedecinComponent]
    });
    fixture = TestBed.createComponent(ConsulterMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
