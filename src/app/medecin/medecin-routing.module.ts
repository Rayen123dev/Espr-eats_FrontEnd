import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultationsMedecinComponent } from './consultations-medecin/consultations-medecin.component';
import { ConsultationDetailComponent } from './consultation-detail/consultation-detail.component';
import { ValidationsMenuComponent } from './validations-menu/validations-menu.component';
import { SuiviEtudiantComponent } from './suivi-etudiant/suivi-etudiant.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'consultations', component: ConsultationsMedecinComponent },
  { path: 'consultation/:id', component: ConsultationDetailComponent },
  { path: 'medecin/validation-menus', component: ValidationsMenuComponent } ,
  { path: 'medecin/suivi-etudiant', component: SuiviEtudiantComponent } ,


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedecinRoutingModule {}
