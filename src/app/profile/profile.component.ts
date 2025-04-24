import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService, User } from '../login.service';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { WeatherServiceService } from '../weather-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  user: User = {
    idUser: 0,
    nom: '',
    email: '',
    age: '',
    role: '',
    avatarUrl: '',
    link_Image: '',
    verified: false,
    lastLogin: new Date()
  };

  currentTime: string = '';

  editMode = false;
  profileForm!: FormGroup;
  isLoading = true;
  errorMessage = '';

  // Updated stats with more specific typing
  stats = {
    mealsServed: 0,
    averageRating: 0,
    menuVariety: 0
  };

  // Role options for dropdown
  roleOptions = [
    { value: 'User', label: 'User' },
    { value: 'Medcin', label: 'Medcin' },
    { value: 'Staff', label: 'Staff' },
    { value: 'Admin', label: 'Admin' }
  ];
  weatherData: any;

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private weatherService: WeatherServiceService // Assuming you have a WeatherService for fetching weather data
  ) {
    this.initializeForm();
  }

  // Initialize form with validators
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      nom: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      age: ['', [
        Validators.required, 
        Validators.min(18), 
        Validators.max(120)
      ]],
      role: ['', Validators.required],
      is_verified: [false] // Add this line to include is_verified in the form
    });
  }

  ngOnInit(): void {
    const userId = this.loginService.getUserIdFromToken();
    
    if (!userId) {
      this.handleError('Unable to retrieve user ID');
      return;
    }

    this.fetchUserProfile(userId);
    console.log('User ID:', userId);
    const U1= this.loginService.getUserById(userId) || this.user;
    console.log('User:', U1);
    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);

    this.weatherService.getCurrentWeather('Tunis').subscribe(data => {
      this.weatherData = data;
    });
  }

  // Handle file selection for profile image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
    
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Centralized method to fetch user profile
  private fetchUserProfile(userId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.loginService.getUserById(userId)
      .pipe(
        catchError(error => {
          this.handleError('Failed to load user details', error);
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(userData => {
        if (userData) {
          this.user = userData;
          console.log('User data:', this.user);
          this.updateForm();
        }
      });
  }

  // Safely get form control with improved error handling
  getFormControl(name: string): FormControl {
    const control = this.profileForm.get(name);
    if (!control) {
      console.error(`Form control not found: ${name}`);
      throw new Error(`Control not found: ${name}`);
    }
    return control as FormControl;
  }

  // Update form with user data
  private updateForm(): void {
    this.profileForm.patchValue({
      nom: this.user.nom,
      email: this.user.email,
      age: this.user.age,
      role: this.user.role
    });
    
    // If the user has an existing image, we can display it
    if (this.user.link_Image) {
      this.imagePreview = this.user.link_Image;
    }
  }

  // Toggle edit mode
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.updateForm();
    }
  }

  // Save profile changes
  saveChanges(): void {
    const userId = this.loginService.getUserIdFromToken();
    if (userId === null) {
      this.handleError('User ID is missing. Please log in again.');
      return;
    }
  
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.errorMessage = 'Please correct the errors in the form.';
      return;
    }
  
    // Create a function to update user after potential image upload
    const updateUserData = (imageUrl?: string) => {
      const updatedUser: User = {
        ...this.user,
        ...this.profileForm.value
      };
      
      // If we have a new image URL, use it
      if (imageUrl) {
        updatedUser.link_Image = imageUrl;
      }
  
      this.loginService.updateUserProfile(userId.toString(), updatedUser)
        .pipe(
          catchError(error => {
            console.error('Update error:', error);
            this.handleError('Failed to update profile');
            // Reload user data from database
            this.fetchUserProfile(userId);
            return of(null);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe(response => {
          if (response) {
            this.user = updatedUser;
            this.editMode = false;
            // Clear file selection after successful update
            this.selectedFile = null;
          }
        });
    };
  
    this.isLoading = true;
    this.errorMessage = '';
  
    // If a new file is selected, upload it first
    if (this.selectedFile) {
      this.loginService.uploadImage(this.selectedFile).subscribe({
        next: (uploadRes) => {
          const cloudinaryUrl = uploadRes.imageUrl;
          // Update user with the new image URL
          updateUserData(cloudinaryUrl);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Image upload failed';
          console.error(err);
        }
      });
    } else {
      // No new image, just update the user data
      updateUserData();
    }
  }

  // Mark all controls as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Cancel edit mode
  cancelEdit(): void {
    this.editMode = false;
    this.updateForm();
    this.errorMessage = '';
    // Reset file selection when canceling
    this.selectedFile = null;
    // Reset image preview to the user's current image
    this.imagePreview = this.user.link_Image || null;
  }

  // Logout functionality
  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  // Handle avatar upload - this is replaced by onFileSelected
  uploadAvatar(event: Event): void {
    this.onFileSelected(event);
  }

  // Centralized error handling method
  private handleError(message: string, error?: any): void {
    console.error(message, error);
    this.errorMessage = message;
    this.isLoading = false;
  }


}