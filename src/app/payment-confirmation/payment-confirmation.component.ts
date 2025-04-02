// payment-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbonnementService, Abonnement } from '../../abonnement.service'; // Import Abonnement interface
import { LoginService } from '../login.service';

@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.css'],
})
export class PaymentConfirmationComponent implements OnInit {
  currentUserId: number | null = null;
  subscriptionDetails: Abonnement | null = null; // Update type to Abonnement
  generatedCode: string = '';
  submitting: boolean = false;
  showToast: boolean = false;

  constructor(
    private abonnementService: AbonnementService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.currentUserId = this.loginService.getUserIdFromToken();
  }

  ngOnInit(): void {
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { abonnement: Abonnement };
      this.subscriptionDetails = state.abonnement;
    } else {
      const state = window.history.state;
      if (state && state.abonnement) {
        this.subscriptionDetails = state.abonnement;
      }
    }

    if (!this.subscriptionDetails) {
      console.error('No subscription details found');
      this.router.navigate(['/abonnement']);
      return;
    }

    // Show toast when component loads
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  submitCode(): void {
    if (!this.generatedCode.trim()) {
      alert('Please enter a valid code.');
      return;
    }

    if (!this.currentUserId) {
      alert('User ID is missing. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    this.submitting = true;
    this.abonnementService
      .confirmAbonnement(this.currentUserId, this.generatedCode)
      .subscribe({
        next: (response) => {
          console.log('Subscription confirmed successfully:', response);
          alert('Subscription activated successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error confirming subscription:', error);
          alert('Invalid code or confirmation failed. Please try again.');
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        },
      });
  }
}
