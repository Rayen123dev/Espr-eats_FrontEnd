// email-verification.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {
  verificationStatus: 'loading' | 'success' | 'error' = 'loading';
  message: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get token from URL parameters
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');
      const email = params.get('email');
      
      if (token) {
        this.verifyEmail(token);
      } else {
        this.verificationStatus = 'error';
        this.message = 'Token de vérification manquant';
      }
    });
  }

  verifyEmail(token: string): void {
    this.http.get(`http://localhost:8081/api/auth/verify-email?token=${token}`)
      .pipe(
        finalize(() => {
          // After 3 seconds in success state, redirect to login
          if (this.verificationStatus === 'success') {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          }
        })
      )
      .subscribe(
        (response: any) => {
          this.verificationStatus = 'success';
          this.message = response.message || 'Email vérifié avec succès !';
        },
        (error) => {
          this.verificationStatus = 'error';
          this.message = error.error?.error || 'Une erreur est survenue lors de la vérification';
        }
      );
  }
}