import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontRoutingRoutingModule } from './front-routing-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { PostListComponent } from '../components/post-list/post-list.component';
import { PostDetailsComponent } from '../components/post-details/post-details.component';
import { AddPostComponent } from '../components/add-post/add-post.component';

const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' }, // Default route
  { path: 'posts', component: PostListComponent }, // Post list
  { path: 'posts/post-details/:postID', component: PostDetailsComponent }, // Post details
  { path: 'posts/add-post', component: AddPostComponent }, // Add post
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FrontRoutingRoutingModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class FrontRoutingModule { }
