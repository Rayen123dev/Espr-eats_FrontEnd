import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PostManagementComponent } from '../components/post-management/post-management.component';
import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';

/*const routes: Routes = [
  { 
    path: '', 
    component: AdminLayoutComponent,
    children: [
      { path: 'posts', component: PostManagementComponent },
    ]
  },
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'posts', 
    component: PostManagementComponent 
  },
  // Add other admin routes
];*/
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'posts', component: PostManagementComponent },
      { path: 'dashboard', component: PostManagementComponent }, // Example route
    ],
  },
];

/*@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})*/
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
