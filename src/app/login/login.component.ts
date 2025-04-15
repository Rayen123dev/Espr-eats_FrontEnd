import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoginService } from '../login.service';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  isSubmitted = false;
  errorMessage = '';
  showPassword = false;
  captchaToken = '';
  someObject: any;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    // Initialize the form in the constructor
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false]
    });
  }

  onCaptchaResolved(token: string) {
    this.captchaToken = token;
  }

  ngOnInit(): void {
    // Check if user is already logged in
    const userId = this.loginService.getUserIdFromToken();
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        // Store the token in localStorage/sessionStorage
        localStorage.setItem('authToken', token);
      }
    });
    
    if (userId) {
      this.loginService.getUserById(userId).subscribe({
        next: (user) => {
          // User is already logged in, redirect based on role
          const role = this.loginService.getRole();
          this.redirectBasedOnRole(role || 'Guest');
        },
        error: (error) => {
          console.error('Error fetching user', error);
          // Token might be invalid, do nothing and let user log in again
        }
      });
    }

    this.someObject = this.someObject || {};
    
    // Initialize animations
    this.initFoodAnimation();
  }

  get formControls() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.clearError();
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const credentials = {
      email: this.formControls['email'].value,
      mdp: this.formControls['password'].value,
      captchaToken: this.captchaToken
    };
    
    this.loginService.login(credentials).subscribe({
      next: (data) => {
        // The user ID might not be immediately available
        const userId = this.loginService.getUserIdFromToken();
        
        if (userId) {
          // Ensure user data is fetchable before navigating
          this.loginService.getUserById(userId).subscribe({
            next: () => {
              this.loading = false;
              const role = this.loginService.getRole();
              this.redirectBasedOnRole(role|| 'Guest');
            },
            error: (error) => {
              this.loading = false;
              console.error('Failed to fetch user', error);
              this.errorMessage = 'Failed to load user data. Please try again.';
              
              // Create shaking animation for form
              this.shakeLoginCard();
            }
          });
        } else {
          this.loading = false;
          console.error('No user ID found');
          this.errorMessage = 'Authentication error: Unable to retrieve user ID';
          
          // Create shaking animation for form
          this.shakeLoginCard();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login failed', error);
        
        // Display appropriate error message based on error status
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 403) {
          this.errorMessage = 'Account is locked or inactive';
        } 
        else if (error.status === 429) {
          this.errorMessage = error.error; // <-- Message comme "Compte bloqué temporairement..."
        }
        else {
          this.errorMessage = 'Connection error. Please try again later.';
        }
        
        // Create shaking animation for form
        this.shakeLoginCard();
      }
    });
  }
  
  // Helper method to add shake animation to login card
  private shakeLoginCard(): void {
    const loginCard = document.querySelector('.login-card');
    loginCard?.classList.add('shake');
    setTimeout(() => {
      loginCard?.classList.remove('shake');
    }, 500);
  }
  
  // Helper method to redirect based on role
  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['gestionuser']);
        break;
      case 'User':
        this.router.navigate(['/profile']);
        break;
      case 'Staff':
        this.router.navigate(['/staffdashboard']);
        break;
      case 'Medecin':
        this.router.navigate(['/staffdashboard']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
  loginWithGoogle() {

    this.authService.loginWithGoogle();

  }
  initFoodAnimation(): void {
    // Animation for food icons
    // Ensure gsap is available from the global window object
    const gsap = (window as any).gsap;
    if (!gsap) {
      console.warn('GSAP library not loaded');
      return;
    }

    // Animation for food icons
    const foodIcons = document.querySelectorAll('.food-icon');
    
    foodIcons.forEach((icon, index) => {
      // Set initial positions
      const delay = index * 2;
      
      gsap.set(icon, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 50,
        opacity: 0,
        scale: 0.5
      });
      
      // Create floating animation
      gsap.to(icon, {
        duration: 3 + Math.random() * 2,
        y: '-=30',
        x: '+=15',
        rotation: Math.random() * 10 - 5,
        opacity: 0.8,
        scale: 0.8,
        delay: delay,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    });
  }
}