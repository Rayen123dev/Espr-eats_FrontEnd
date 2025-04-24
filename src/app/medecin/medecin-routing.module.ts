import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultationsMedecinComponent } from './consultations-medecin/consultations-medecin.component';
import { ConsultationDetailComponent } from './consultation-detail/consultation-detail.component';
import { SuiviEtudiantComponent } from './suivi-etudiant/suivi-etudiant.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Medecin' }
  },
  {
    path: 'medecin/consultations', component: ConsultationsMedecinComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Medecin' }
  },
  {
    path: 'medecin/consultation/:id', component: ConsultationDetailComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Medecin' }
  },

  {
    path: 'medecin/suivi-etudiant', component: SuiviEtudiantComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Medecin' }
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedecinRoutingModule { }
