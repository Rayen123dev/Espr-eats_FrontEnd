import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AddReclamationComponent } from './add-reclamation/add-reclamation.component';
import { UserReclamationsComponent } from './user-reclamations/user-reclamations.component';
import { AuthRoutingModule } from './Auth-routing.module';
import { GestionUsersComponent } from './gestion-users/gestion-users.component';
import { AbonnementComponent } from './abonnement/abonnement.component';
import { PaymentConfirmationComponent } from './payment-confirmation/payment-confirmation.component';
import { AbonnementConfirmeComponent } from './abonnement-confirme/abonnement-confirme.component';
import { AbonnementDetailsComponent } from './abonnement-details/abonnement-details.component';
import { AbonnementReportComponent } from './abonnement-report/abonnement-report.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'add-reclamation', component: AddReclamationComponent },
  { path: 'user-reclamations', component: UserReclamationsComponent },
  { path: 'gestionuser', component: GestionUsersComponent },
  { path: 'abonnement', component: AbonnementComponent },
  {
    path: 'abonnement/payment-confirmation',
    component: PaymentConfirmationComponent,
  },
  { path: 'abonnement-confirme', component: AbonnementConfirmeComponent },
  { path: 'abonnement-details', component: AbonnementDetailsComponent },
  { path: 'abonnement-report', component: AbonnementReportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule,AuthRoutingModule]
})
export class AppRoutingModule { }