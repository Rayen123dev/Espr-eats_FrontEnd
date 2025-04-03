import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AddReclamationComponent } from './add-reclamation/add-reclamation.component';
import { UserReclamationsComponent } from './user-reclamations/user-reclamations.component';
import { AuthRoutingModule } from './Auth-routing.module';
import { GestionUsersComponent } from './gestion-users/gestion-users.component';
import { MenuDashboardComponent } from './components/menu-dashboard/menu-dashboard.component';
import { MenuComponent } from './components/menu/menu.component';

import { PlatComponent } from './components/plat/plat.component';
import { RegimeComponent } from './components/regime/regime.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'add-reclamation', component: AddReclamationComponent },   
  { path: 'user-reclamations', component: UserReclamationsComponent },
  { path: 'gestionuser', component: GestionUsersComponent},
  {path:'menu', component: MenuComponent},
  {path:'plat', component: PlatComponent},
  {path:'regime', component: RegimeComponent},
  { path: 'staffdashboard', component: StaffDashboardComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule,AuthRoutingModule]
})
export class AppRoutingModule { }