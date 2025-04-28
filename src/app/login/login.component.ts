import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  loginForm: FormGroup;
  loading = false;
  isSubmitted = false;
  errorMessage = '';
  showPassword = false;
  captchaToken = '';
  someObject: any;
  
  private animationFrameId!: number;
  private particlesArray: any[] = [];

  constructor(
    private el: ElementRef,
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
    
    // Initialize food icon animations
    this.initFoodIconAnimations();
    
    // Create restaurant utensil elements
    this.createRestaurantParticles();
    
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
  
  ngAfterViewInit(): void {
    // Initialize the canvas animation
    this.initCanvasAnimation();
    
    // Add floating labels effect
    const inputs = this.el.nativeElement.querySelectorAll('input');
    inputs.forEach((input: HTMLInputElement) => {
      input.addEventListener('focus', () => {
        if (input.parentElement) {
          input.parentElement.classList.add('focused');
        }
      });
      
      input.addEventListener('blur', () => {
        if (input.value === '') {
          if (input.parentElement) {
            input.parentElement.classList.remove('focused');
          }
        }
      });
    });
  }
  
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
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
              this.redirectBasedOnRole(role || 'Guest');
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
        this.router.navigate(['/admin-layout/gestionuser']);
        break;
      case 'User':
        this.router.navigate(['/face-confirmation']);
        break;
      case 'Staff':
        this.router.navigate(['/staffdashboard']);
        break;
      case 'Medecin':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
  
  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  // Initialize animated food icons with random positions
  initFoodIconAnimations(): void {
    const foodIcons = document.querySelectorAll('.food-icon');
    foodIcons.forEach((icon: Element, index) => {
      // Set random initial positions
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomDelay = index * 0.8;
      
      (icon as HTMLElement).style.left = `${randomX}%`;
      (icon as HTMLElement).style.top = `${randomY}%`;
      (icon as HTMLElement).style.animationDelay = `${randomDelay}s`;
    });
  }
  
  // Create restaurant-themed particles (plates, forks, spoons)
  private createRestaurantParticles(): void {
    const container = document.getElementById('food-particles');
    if (!container) return;
    
    // Create plates
    for (let i = 0; i < 10; i++) {
      const plate = document.createElement('div');
      plate.classList.add('plate');
      plate.style.left = `${Math.random() * 100}%`;
      plate.style.top = `${Math.random() * 100}%`;
      plate.style.animationDelay = `${Math.random() * 15}s`;
      container.appendChild(plate);
    }
    
    // Create forks
    for (let i = 0; i < 8; i++) {
      const fork = document.createElement('div');
      fork.classList.add('fork');
      fork.style.left = `${Math.random() * 100}%`;
      fork.style.top = `${Math.random() * 100}%`;
      fork.style.animationDelay = `${Math.random() * 20}s`;
      container.appendChild(fork);
    }
    
    // Create spoons
    for (let i = 0; i < 8; i++) {
      const spoon = document.createElement('div');
      spoon.classList.add('spoon');
      spoon.style.left = `${Math.random() * 100}%`;
      spoon.style.top = `${Math.random() * 100}%`;
      spoon.style.animationDelay = `${Math.random() * 18}s`;
      container.appendChild(spoon);
    }
  }

  // Initialize canvas for particle animation with restaurant red theme
  initCanvasAnimation(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particle settings - restaurant red theme colors
    this.particlesArray = [];
    const numberOfParticles = 80;
    const colors = ['#FF0000', '#CC0000', '#990000', '#800000', '#660000', '#FF3333'];
    
    // Create Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      ctx: CanvasRenderingContext2D;
    
      constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
    
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
    
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
    
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
    
      draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
    
    
    // Create particles
    for (let i = 0; i < numberOfParticles; i++) {
      this.particlesArray.push(new Particle(ctx));
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < this.particlesArray.length; i++) {
        this.particlesArray[i].update();
        this.particlesArray[i].draw();
        
        // Connect particles with lines
        for (let j = i; j < this.particlesArray.length; j++) {
          const dx = this.particlesArray[i].x - this.particlesArray[j].x;
          const dy = this.particlesArray[i].y - this.particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = this.particlesArray[i].color;
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = 0.5;
            ctx.moveTo(this.particlesArray[i].x, this.particlesArray[i].y);
            ctx.lineTo(this.particlesArray[j].x, this.particlesArray[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialize particles on resize
      this.particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        this.particlesArray.push(new Particle(ctx));
      }
    });
    
    animate();
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