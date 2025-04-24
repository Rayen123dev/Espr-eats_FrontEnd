import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('spin', [
      transition(':enter', [
        style({ transform: 'rotate(0deg)' }),
        animate('1500ms linear', style({ transform: 'rotate(360deg)' }))
      ])
    ])
  ]
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  isVerified = false;
  errorMessage = '';
  email = '';
  countdownTimer = 5;
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    console.log('Component initialized');
    alert('Component loaded');
    this.verifyEmail();
  }

  verifyEmail(): void {
    console.log('Hello');
    this.route.queryParams.subscribe({
      next: (params) => {
        console.log('📦 Query Params:', params);
        const token = params['token'];
        this.email = params['email'] || '';
    
        console.log('🔐 Token:', token);
        console.log('📧 Email:', this.email);
      },
      error: (err) => {
        console.error('🚨 QueryParams Error:', err);
      }
    });
    
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      this.email = params['email'] || '';
    
      // Vérification du token et de l'email avant d'envoyer la requête
      console.log('Token récupéré:', token);
      console.log('Email récupéré:', this.email);
    
      if (!token) {
        this.isLoading = false;
        this.errorMessage = 'Token de vérification manquant.';
        return;
      }
  
      // Call the backend API for email verification
      this.loginService.verifyEmail(token, this.email).subscribe({
        next: (res) => {
          console.log('✅ Verified:', res);
          this.isVerified = true;
          this.isLoading = false;
          this.startCountdown();
        },
        error: (err) => {
          console.error('❌ Error verifying email:', err);
          this.isVerified = false;
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la vérification.';
        }
      });
    });
  }
  
  

  // Start countdown before auto-redirecting to login
  startCountdown(): void {
    this.timerInterval = setInterval(() => {
      this.countdownTimer--;
      if (this.countdownTimer <= 0) {
        clearInterval(this.timerInterval);
        this.navigateToLogin();
      }
    }, 1000);
  }

  // Navigation methods
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  // Clean up timer on component destruction
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}