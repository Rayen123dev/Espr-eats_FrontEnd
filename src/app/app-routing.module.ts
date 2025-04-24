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
import { AuthGComponent } from './auth-g/auth-g.component';
import { FaceConfirmationComponent } from './face-confirmation/face-confirmation.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { HomeComponent } from './home/home.component';
import { ProfilNutritionnelComponent } from './profil-nutritionnel/profil-nutritionnel.component';
import { ProfilNutritionnelFormComponent } from './profil-nutritionnel-form/profil-nutritionnel-form.component';
import { ProfilNutritionnelDetailComponent } from './profil-nutritionnel-detail/profil-nutritionnel-detail.component';
import { ConsulterMedecinComponent } from './consulter-medecin/consulter-medecin.component';
import { MesConsultationsComponent } from './mes-consultations/mes-consultations.component';
import { VisioComponent } from './visio/visio.component';
import { AnalysePlatComponent } from './analyse-plat/analyse-plat.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'email-verification', component: EmailVerificationComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'add-reclamation', component: AddReclamationComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'User' }
  },
  { path: 'user-reclamations', component: UserReclamationsComponent, canActivate: [AuthGuard] },
  {
    path: 'gestionuser', component: GestionUsersComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Admin' }
  },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  {
    path: 'staffdashboard',
    component: StaffDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Medecin'] }
  },
  {
    path: 'staffdashboard/:data',
    component: StaffDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Medecin'] }
  },
  {
    path: 'plat/:id', component: PlatComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Staff' }
  },
  {
    path: 'MenuDashboardComponent', component: MenuDashboardComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Admin', 'Medecin'] }
  },

  {
    path: 'profil-nutritionnel', component: ProfilNutritionnelComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },
  {
    path: 'profil-nutritionnel/create', component: ProfilNutritionnelFormComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },
  {
    path: 'profil-nutritionnel/mon-profil', component: ProfilNutritionnelDetailComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },
  {
    path: 'consulter-medecin', component: ConsulterMedecinComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },
  {
    path: 'mes-consultations', component: MesConsultationsComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },
  {
    path: 'visio/:id', component: VisioComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },
  {
    path: 'analyse-plat', component: AnalysePlatComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['User'] }
  },


  { path: 'auth', component: AuthGComponent }, // Route for OAuth2 success page

  { path: 'face-confirmation', component: FaceConfirmationComponent, canActivate: [AuthGuard] },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
