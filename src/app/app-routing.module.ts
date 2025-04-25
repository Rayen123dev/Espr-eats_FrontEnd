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
import { ProduitDashboardComponent } from './pages/products/produit-dashboard/produit-dashboard.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProduitHistoriqueComponent } from './pages/products/produit-historique/produit-historique.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'email-verification', component: EmailVerificationComponent },

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
  {
    path: 'staffdashboard/:data',
    component: StaffDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Medecin'] }
  },
  { path: 'plat/:id', component: PlatComponent, canActivate: [AuthGuard],
    data: { expectedRole: 'Staff' } },
  { path: 'MenuDashboardComponent', component: MenuDashboardComponent, canActivate: [AuthGuard],
    data: { expectedRoles: ['Staff', 'Admin', 'Medecin'] } },

    { path: 'produits-dashboard', component: ProduitDashboardComponent, canActivate: [AuthGuard] , data: { expectedRole: 'Admin' }  },
    { path: 'products', redirectTo: '/produits-dashboard', pathMatch: 'full' },
    { path: 'add-product', component: ProductFormComponent, canActivate: [AuthGuard] },
    { path: 'produit-historique', component: ProduitHistoriqueComponent, canActivate: [AuthGuard] },
    { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuard] },
    { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [AuthGuard] },

  { path: 'auth' , component: AuthGComponent }, // Route for OAuth2 success page

  { path: 'face-confirmation', component: FaceConfirmationComponent, canActivate: [AuthGuard] },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }