import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApplicationManagementComponent } from './job-application-management.component';

describe('JobApplicationManagementComponent', () => {
  let component: JobApplicationManagementComponent;
  let fixture: ComponentFixture<JobApplicationManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobApplicationManagementComponent]
    });
    fixture = TestBed.createComponent(JobApplicationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
