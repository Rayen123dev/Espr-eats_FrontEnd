import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { PostManagementComponent } from './components/post-management/post-management.component';




@NgModule({
  declarations: [
    PostManagementComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminLayoutComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([])
  ]
})
export class AdminModule { }
