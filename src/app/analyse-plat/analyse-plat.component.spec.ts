import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysePlatComponent } from './analyse-plat.component';

describe('AnalysePlatComponent', () => {
  let component: AnalysePlatComponent;
  let fixture: ComponentFixture<AnalysePlatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalysePlatComponent]
    });
    fixture = TestBed.createComponent(AnalysePlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
