import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { PostManagementComponent } from './components/post-management/post-management.component';
import { JobOfferManagementComponent } from './components/job-offer-management/job-offer-management.component';
import { JobApplicationManagementComponent } from './components/job-application-management/job-application-management.component'; // ✅ Add this


@NgModule({
  declarations: [
    PostManagementComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminLayoutComponent,
    JobOfferManagementComponent,
    JobApplicationManagementComponent, // ✅ Add here

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule  // ✅ just RouterModule, no forRoot here
  ]
})
export class AdminModule { }
