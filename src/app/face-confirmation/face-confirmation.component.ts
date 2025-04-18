// face-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-face-confirmation',
  templateUrl: './face-confirmation.component.html',
  styleUrls: ['./face-confirmation.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('slideInOut', [
      state('void', style({
        transform: 'translateY(20px)',
        opacity: 0
      })),
      transition('void <=> *', animate('400ms ease-out')),
    ]),
    trigger('pulse', [
      state('inactive', style({
        transform: 'scale(1)'
      })),
      state('active', style({
        transform: 'scale(1.05)'
      })),
      transition('inactive <=> active', animate('300ms ease-in-out'))
    ])
  ]
})
export class FaceConfirmationComponent implements OnInit {
  webcamImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();
  isVerifying: boolean = false;
  verificationResult: 'success' | 'failure' | null = null;
  showWebcam: boolean = true;
  countdown: number = 0;
  pulseState: 'active' | 'inactive' = 'inactive';
  errorMessage: string = '';
  
  // Webcam options
  webcamOptions = {
    width: 400,
    height: 400,
    imageQuality: 0.92,
    facingMode: "user"
  };

  constructor(private http: HttpClient, private router: Router, private loginService: LoginService) {}

  ngOnInit() {
    this.startPulseAnimation();
  }
  handleError(arg0: string) {
    throw new Error('Method not implemented.');
  }
  fetchUserProfile(userId: number) {
    throw new Error('Method not implemented.');
  }

  startPulseAnimation() {
    setInterval(() => {
      this.pulseState = this.pulseState === 'active' ? 'inactive' : 'active';
    }, 2000);
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  captureImage(): void {
    this.startCountdown();
  }

  startCountdown(): void {
    this.countdown = 3;
    this.errorMessage = '';
    this.verificationResult = null;
    
    const interval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown === 0) {
        clearInterval(interval);
        setTimeout(() => {
          this.trigger.next();
        }, 500);
      }
    }, 1000);
  }

  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.showWebcam = false;
    this.isVerifying = true;
    
    // Convert data URL to File object
    const imageFile = this.dataURLtoFile(webcamImage.imageAsDataUrl, 'webcam-image.jpg');
    
    // First upload the image to Cloudinary
    this.loginService.uploadImage(imageFile).subscribe({
      next: (uploadRes) => {
        const cloudinaryUrl = uploadRes.imageUrl;
        console.log('Image uploaded to Cloudinary:', cloudinaryUrl);
        
        // Now use the Cloudinary URL for face verification
        // Choose ONE verification method - using the service
        this.loginService.vvv(cloudinaryUrl).subscribe({
          next: (verificationRes) => {
            this.isVerifying = false;
            console.log('Face verification result:', verificationRes);
            const apiUserId = verificationRes.results[0];
            const userId = this.loginService.getUserIdFromToken();
            if (apiUserId == userId) {
              this.verificationResult = 'success';
              this.router.navigate(['/profile']);
            } else {
              this.verificationResult = 'failure';
              this.errorMessage = "Face verification failed. Your face doesn't match our records.";
              setTimeout(() => {
                this.retryCapture();
              }, 3000);
            }
          },
          error: (err) => {
            this.isVerifying = false;
            this.verificationResult = 'failure';
            console.error('Face verification error:', err);
            this.errorMessage = 'Verification service unavailable. Please try again later.';
            setTimeout(() => {
              this.retryCapture();
            }, 3000);
          }
        });
      },
      error: (error) => {
        this.isVerifying = false;
        console.error('Error uploading to Cloudinary:', error);
        this.errorMessage = 'Failed to upload image. Please try again.';
        this.retryCapture();
      }
    });
  }
  
  // Remove the separate verifyFace method if you're using the LoginService
  
  // Helper function to convert data URL to File object
  private dataURLtoFile(dataUrl: string, filename: string): File {
    // Split the base64 string in data:image/jpeg;base64,... format
    const arr = dataUrl.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    // Return a File object
    return new File([u8arr], filename, { type: mime });
  }

  retryCapture(): void {
    this.webcamImage = null;
    this.showWebcam = true;
    this.verificationResult = null;
    this.errorMessage = '';
  }

  handleInitError(error: WebcamInitError): void {
    console.error('Webcam error:', error);
    this.errorMessage = 'Could not access camera. Please ensure camera permissions are enabled.';
  }
}