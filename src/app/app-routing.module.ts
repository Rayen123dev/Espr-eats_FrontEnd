import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AddReclamationComponent } from './add-reclamation/add-reclamation.component';
import { UserReclamationsComponent } from './user-reclamations/user-reclamations.component';
import { AuthRoutingModule } from './Auth-routing.module';
import { GestionUsersComponent } from './gestion-users/gestion-users.component';
import { MenuComponent } from './components/menu/menu.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { PlatComponent } from './components/plat/plat.component';
import { MenuDashboardComponent } from './components/menu-dashboard/menu-dashboard.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'add-reclamation', component: AddReclamationComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'User' } },   
  { path: 'user-reclamations', component: UserReclamationsComponent, canActivate: [AuthGuard] },
  { path: 'gestionuser', component: GestionUsersComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Admin' } },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  {
    path: 'staffdashboard',
    component: StaffDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Medecin'] }
  },
  { path: 'plat/:id', component: PlatComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Staff' } },
  { path: 'MenuDashboardComponent', component: MenuDashboardComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Admin', 'Medecin'] } },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }