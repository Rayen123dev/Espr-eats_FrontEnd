import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService, User } from 'src/app/login.service';

@Component({
  selector: 'app-header-medecin',
  templateUrl: './header-medecin.component.html',
  styleUrls: ['./header-medecin.component.scss']
})
export class HeaderMedecinComponent implements OnInit {
  userName: string = 'Docteur';
  userProfileImage: string = 'assets/default-avatar.png';
  isProfileDropdownOpen: boolean = false;

  navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Menus à valider', path: '/staffdashboard' },
    { label: 'Consultations', path: '/medecin/consultations' },
    { label: 'Suivi étudiants', path: '/medecin/suivi-etudiant' }
  ];


  constructor(public router: Router, private loginService: LoginService) {}


  ngOnInit(): void {
    const userId = this.loginService.getUserIdFromToken();
    if (userId) {
      this.loginService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.userName = user.nom;
          this.userProfileImage = user.avatarUrl || this.userProfileImage;
        },
        error: (err) => {
          console.error('Erreur récupération médecin', err);
        }
      });
    }
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.isProfileDropdownOpen = false;
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.user-profile')) {
      this.isProfileDropdownOpen = false;
    }
  }
}
