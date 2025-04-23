import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailsComponent } from './components/post-details/post-details.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { AddPostComponent } from './components/add-post/add-post.component';
import { AdminModule } from './admin/admin.module';
import { PostManagementComponent } from './admin/components/post-management/post-management.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout/admin-layout.component';
import { AppComponent } from './app.component';
/*
const routes:Routes=[
  {path:"",redirectTo:"home",pathMatch:"full"},
  { path: 'posts', component: PostListComponent },
  { path: 'posts/post-details/:postID', component: PostDetailsComponent },
  { path: 'posts/add-post', component: AddPostComponent },
  { path: 'admin', component: PostManagementComponent },
   // Backoffice routes
   {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
    ]
  },
  // Default route
  { 
    path: '', 
    redirectTo: 'posts', 
    pathMatch: 'full' 
  } 
];*/

const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent, // Use AdminLayoutComponent for admin routes
    loadChildren: () =>
      import('./admin/admin-routing/admin-routing.module').then(
        (m) => m.AdminRoutingModule
      ),
  },
  {
    path: '',
    component: AppComponent, // Use AppComponent for non-admin routes
    loadChildren: () =>
      import('./front-routing/front-routing.module').then(
        (m) => m.FrontRoutingModule
      ),
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
