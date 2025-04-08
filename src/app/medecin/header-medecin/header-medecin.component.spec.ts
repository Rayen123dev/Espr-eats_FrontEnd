import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMedecinComponent } from './header-medecin.component';

describe('HeaderMedecinComponent', () => {
  let component: HeaderMedecinComponent;
  let fixture: ComponentFixture<HeaderMedecinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderMedecinComponent]
    });
    fixture = TestBed.createComponent(HeaderMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
