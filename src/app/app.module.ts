import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ForgetPasswordComponent } from './forget-password/forgot-password.component';
import { SignupComponent } from './signup/signup.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { AddReclamationComponent } from './add-reclamation/add-reclamation.component';
import { UserReclamationsComponent } from './user-reclamations/user-reclamations.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthRoutingModule } from './Auth-routing.module';
import { GestionUsersComponent } from './gestion-users/gestion-users.component';
import { AuthService } from './auth-service.service';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { MenuComponent } from './components/menu/menu.component';
import { PlatComponent } from './components/plat/plat.component';
import { MenuDashboardComponent } from './components/menu-dashboard/menu-dashboard.component';
import { RegimeComponent } from './components/regime/regime.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';


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
    MenuDashboardComponent,
    PlatComponent,
    RegimeComponent,
    StaffDashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatTooltipModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    AuthRoutingModule,
    BrowserModule,
    NgChartsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
