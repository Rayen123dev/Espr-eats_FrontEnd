import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AddReclamationComponent } from './add-reclamation/add-reclamation.component';
import { UserReclamationsComponent } from './user-reclamations/user-reclamations.component';
import { AuthRoutingModule } from './Auth-routing.module';
import { GestionUsersComponent } from './gestion-users/gestion-users.component';
import { ProfilNutritionnelComponent } from './profil-nutritionnel/profil-nutritionnel.component';
import { ProfilNutritionnelFormComponent } from './profil-nutritionnel-form/profil-nutritionnel-form.component';
import { ProfilNutritionnelDetailComponent } from './profil-nutritionnel-detail/profil-nutritionnel-detail.component';
import { ConsulterMedecinComponent } from './consulter-medecin/consulter-medecin.component';
import { MesConsultationsComponent } from './mes-consultations/mes-consultations.component';
import { ConsultationsMedecinComponent } from './medecin/consultations-medecin/consultations-medecin.component';
import { DashboardComponent } from './medecin/dashboard/dashboard.component';
import { HeaderMedecinComponent } from './medecin/header-medecin/header-medecin.component';
import { ConsultationDetailComponent } from './medecin/consultation-detail/consultation-detail.component';
import { VisioComponent } from './visio/visio.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'add-reclamation', component: AddReclamationComponent },
  { path: 'user-reclamations', component: UserReclamationsComponent },
  { path: 'gestionuser', component: GestionUsersComponent},
  { path: 'profil-nutritionnel', component: ProfilNutritionnelComponent },
  { path: 'profil-nutritionnel/create', component: ProfilNutritionnelFormComponent },
  { path: 'profil-nutritionnel', component: ProfilNutritionnelComponent},
  { path: 'profil-nutritionnel/create', component: ProfilNutritionnelFormComponent},
  { path: 'profil-nutritionnel/mon-profil', component: ProfilNutritionnelDetailComponent},
  { path: 'consulter-medecin', component: ConsulterMedecinComponent },
  { path: 'mes-consultations', component: MesConsultationsComponent },
  { path: 'medecin/dashboard', component: DashboardComponent },
  { path: 'medecin/consultations', component: ConsultationsMedecinComponent},
  { path: 'medecin/consultation/:id', component: ConsultationDetailComponent},
  { path: 'header-medecin', component: HeaderMedecinComponent},
  { path: 'visio/:id', component: VisioComponent }



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule,AuthRoutingModule]
})
export class AppRoutingModule { }
