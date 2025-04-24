import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceConfirmationComponent } from './face-confirmation.component';

describe('FaceConfirmationComponent', () => {
  let component: FaceConfirmationComponent;
  let fixture: ComponentFixture<FaceConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaceConfirmationComponent]
    });
    fixture = TestBed.createComponent(FaceConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
