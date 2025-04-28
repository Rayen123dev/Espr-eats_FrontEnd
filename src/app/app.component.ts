import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service'; // <-- important !

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public router: Router, private loginService: LoginService) { }

  shouldHideHeader(): boolean {
    const hiddenRoutes = [
      '/login', '/signup', '/forgot-password', '/verify-email', 
      '/reset-password', '/home', '/auth', '/face-confirmation', 
      '/email-verification', '/recaptcha', '/plat', '/regime', 
      '/staff-dashboard'
    ];
    const currentRoute = this.router.url.split('?')[0];
    return hiddenRoutes.includes(currentRoute);
  }

  shouldHideFooter(): boolean {
    const hiddenRoutes = [
      '/login', '/signup', '/forgot-password', '/verify-email', '/reset-password','/admin-layout/gestionuser','/admin-layout/staffdashboard','/admin-layout/produits-dashboard','/admin-layout/gestionlivreur','/admin-layout/admin','/admin-layout/job-offer-management','/admin-layout/abonnement-report'
    ];
    const currentRoute = this.router.url.split('?')[0];
    return hiddenRoutes.includes(currentRoute);
  }
  

  isMedecinDashboard(): boolean {
    return this.loginService.getRole() === 'Medecin'; // 🔥 Vérifie bien l’orthographe du rôle
  }
}
