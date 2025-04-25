import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisioComponent } from './visio.component';

describe('VisioComponent', () => {
  let component: VisioComponent;
  let fixture: ComponentFixture<VisioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisioComponent]
    });
    fixture = TestBed.createComponent(VisioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
