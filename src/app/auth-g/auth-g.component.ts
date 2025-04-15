import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-g',
  templateUrl: './auth-g.component.html',
  styleUrls: ['./auth-g.component.css']
})
export class AuthGComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        // Store token and fetch user data
        this.authService.storeAuthToken(token);

        this.authService.handleOAuth2Success(token).subscribe({
          next: (user) => {
            console.log('OAuth2 User Profile:', user);

            // Role-based redirection
            const role = user.role || 'Guest';
            this.redirectBasedOnRole(role);
          },
          error: (error) => {
            console.error('Error fetching user profile', error);
            // You could show an error message or redirect to login
          }
        });
      } else {
        console.error('OAuth2 token not found');
        this.router.navigate(['/login']);
      }
    });
  }

  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['gestionuser']);
        break;
      case 'User':
        this.router.navigate(['/profile']);
        break;
      case 'Staff':
      case 'Medecin':
        this.router.navigate(['/staffdashboard']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}
