import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
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
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  isSubmitted = false;
  errorMessage = '';
  showPassword = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;


  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    // Initialize the form in the constructor instead of ngOnInit
    this.signupForm = this.formBuilder.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      role: ['User'],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // We still initialize animations in ngOnInit
    this.initFoodAnimation();
  }

  get formControls() {
    return this.signupForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submitSignup(credentials: any): void {
    this.loginService.register(credentials).subscribe({
      next: (data) => {
        console.log('Registration successful:', data);
        this.router.navigate(['/login']); // Or wherever you want to redirect
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.loading = false;

        if (error.status === 403) {
          this.errorMessage = 'Access forbidden.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid credentials.';
        } else {
          this.errorMessage = 'Connection error. Please try again.';
        }

        const loginCard = document.querySelector('.login-card');
        loginCard?.classList.add('shake');
        setTimeout(() => loginCard?.classList.remove('shake'), 500);
      }
    });
  }


  onSubmit(): void {
    this.isSubmitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;

    const formValues = this.signupForm.value;

    // Step 1: Upload image if selected
    if (this.selectedFile) {
      this.loginService.uploadImage(this.selectedFile).subscribe({
        next: (uploadRes) => {
          const cloudinaryUrl = uploadRes.imageUrl;

          // Step 2: Continue registration using the Cloudinary image URL
          const credentials = {
            nom: formValues.nom,
            email: formValues.email,
            age: formValues.age,
            mdp: formValues.password,
            role: formValues.role,
            link_Image: cloudinaryUrl
          };

          this.submitSignup(credentials);
        },
        error: (err) => {
          this.errorMessage = 'Image upload failed';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      // No image selected, use default
      const credentials = {
        nom: formValues.nom,
        email: formValues.email,
        age: formValues.age,
        mdp: formValues.password,
        role: formValues.role,
        link_Image: '/assets/default-avatar.png'
      };

      this.submitSignup(credentials);
    }
  }



  // Navigate based on role
  navigateBasedOnRole(): void {
    const role = this.loginService.getRole();
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'USER':
        this.router.navigate(['/menu']);
        break;
      case 'STAFF':
        this.router.navigate(['/staff/orders']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }

  clearError(): void {
    this.errorMessage = '';
  }

  initFoodAnimation(): void {
    // Animation for food icons - unchanged
    const gsap = (window as any).gsap;
    if (!gsap) {
      console.warn('GSAP library not loaded');
      return;
    }

    const foodIcons = document.querySelectorAll('.food-icon');

    foodIcons.forEach((icon, index) => {
      const delay = index * 2;

      gsap.set(icon, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 50,
        opacity: 0,
        scale: 0.5
      });

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

  roleOptions = ['User', 'Staff', 'Admin', 'Medecin'];

  selectRole(role: string): void {
    this.signupForm.patchValue({ role: role });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Store the file for later upload
      this.selectedFile = file;

      // Create a FileReader to generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        console.log('Image Preview created');
      };
      reader.readAsDataURL(file);

      // Log file details
      console.log('File Details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
  }

  getPasswordStrengthClass(): string {
    const password = this.formControls['password'].value;
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const password = this.formControls['password'].value;
    if (!password) return '';
    if (password.length < 6) return 'Weak Password';
    if (password.length < 10) return 'Medium Strength';
    return 'Strong Password';
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'User': return 'fas fa-user';
      case 'Staff': return 'fas fa-users';
      case 'Admin': return 'fas fa-crown';
      case 'Medecin': return 'fas fa-briefcase-medical';
      default: return 'fas fa-user';
    }
  }
}
