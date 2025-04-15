import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service'; // <-- important !

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public router: Router, private loginService: LoginService) {}

  shouldHideHeader(): boolean {
    const hiddenRoutes = ['/login', '/signup', '/forgot-password', '/verify-email', '/reset-password', '/home'];
    return hiddenRoutes.includes(this.router.url);
  }

  isMedecinDashboard(): boolean {
    return this.loginService.getRole() === 'Medcin'; // 🔥 Vérifie bien l’orthographe du rôle
  }
}
