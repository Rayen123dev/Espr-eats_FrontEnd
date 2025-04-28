import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AuthRoutingModule } from './Auth-routing.module';

import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forgot-password.component';
import { SignupComponent } from './signup/signup.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { AddReclamationComponent } from './add-reclamation/add-reclamation.component';
import { UserReclamationsComponent } from './user-reclamations/user-reclamations.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { GestionUsersComponent } from './gestion-users/gestion-users.component';
import { MenuComponent } from './components/menu/menu.component';
import { PlatComponent } from './components/plat/plat.component';
import { MenuDashboardComponent } from './components/menu-dashboard/menu-dashboard.component';
import { RegimeComponent } from './components/regime/regime.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { AuthGComponent } from './auth-g/auth-g.component';
import { HomeComponent } from './home/home.component';
import { FaceConfirmationComponent } from './face-confirmation/face-confirmation.component';
import { ProfilNutritionnelComponent } from './profil-nutritionnel/profil-nutritionnel.component';
import { ProfilNutritionnelFormComponent } from './profil-nutritionnel-form/profil-nutritionnel-form.component';
import { ProfilNutritionnelDetailComponent } from './profil-nutritionnel-detail/profil-nutritionnel-detail.component';
import { ConsulterMedecinComponent } from './consulter-medecin/consulter-medecin.component';
import { MesConsultationsComponent } from './mes-consultations/mes-consultations.component';
import { VisioComponent } from './visio/visio.component';
import { AnalysePlatComponent } from './analyse-plat/analyse-plat.component';
import { AbonnementComponent } from './abonnement/abonnement.component';
import { PaymentConfirmationComponent } from './payment-confirmation/payment-confirmation.component';
import { AbonnementConfirmeComponent } from './abonnement-confirme/abonnement-confirme.component';
import { AbonnementDetailsComponent } from './abonnement-details/abonnement-details.component';
import { AbonnementReportComponent } from './abonnement-report/abonnement-report.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { AddPostComponent } from './components/add-post/add-post.component';
import { PostDetailsComponent } from './components/post-details/post-details.component';
import { ReplyFormComponent } from './components/reply-form/reply-form.component';
import { TruncatePipe } from './shared/truncate.pipe';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { JobOfferListComponent } from './components/job-offer-list/job-offer-list.component';

// External Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { CountUpModule } from 'ngx-countup';
import { WebcamModule } from 'ngx-webcam';
import { NgChartsModule } from 'ng2-charts';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { ProductsModule } from './pages/products/products.module';
import { MedecinModule } from './medecin/medecin.module';
import { AdminModule } from './admin/admin.module';

import { AuthService } from './auth-service.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgetPasswordComponent,
    SignupComponent,
    EmailVerificationComponent,
    ResetPasswordComponent,
    ProfileComponent,
    AddReclamationComponent,
    UserReclamationsComponent,
    HeaderComponent,
    FooterComponent,
    GestionUsersComponent,
    MenuComponent,
    PlatComponent,
    RegimeComponent,
    MenuDashboardComponent,
    StaffDashboardComponent,
    AuthGComponent,
    HomeComponent,
    FaceConfirmationComponent,
    ProfilNutritionnelComponent,
    ProfilNutritionnelFormComponent,
    ProfilNutritionnelDetailComponent,
    ConsulterMedecinComponent,
    MesConsultationsComponent,
    VisioComponent,
    AnalysePlatComponent,
    AbonnementComponent,
    PaymentConfirmationComponent,
    AbonnementConfirmeComponent,
    AbonnementDetailsComponent,
    AbonnementReportComponent,
    PostListComponent,
    AddPostComponent,
    PostDetailsComponent,
    ReplyFormComponent,
    TruncatePipe,
    SidebarComponent,
    AdminLayoutComponent,
    JobOfferListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,
    AuthRoutingModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSnackBarModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    CountUpModule,
    WebcamModule,
    NgChartsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    ProductsModule,
    MedecinModule,
    AdminModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }