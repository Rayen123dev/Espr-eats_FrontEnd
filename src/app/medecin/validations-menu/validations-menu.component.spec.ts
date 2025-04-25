import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationsMenuComponent } from './validations-menu.component';

describe('ValidationsMenuComponent', () => {
  let component: ValidationsMenuComponent;
  let fixture: ComponentFixture<ValidationsMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationsMenuComponent]
    });
    fixture = TestBed.createComponent(ValidationsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
