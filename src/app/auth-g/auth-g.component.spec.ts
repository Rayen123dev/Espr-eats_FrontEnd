import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthGComponent } from './auth-g.component';

describe('AuthGComponent', () => {
  let component: AuthGComponent;
  let fixture: ComponentFixture<AuthGComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuthGComponent]
    });
    fixture = TestBed.createComponent(AuthGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
