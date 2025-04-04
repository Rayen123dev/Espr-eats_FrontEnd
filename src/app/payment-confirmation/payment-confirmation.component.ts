import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbonnementService, Abonnement } from '../../abonnement.service';
import { LoginService, User } from '../login.service';
import { mapUserToUserInfo, UserInfo } from '../user-info.interface';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.css'],
})
export class PaymentConfirmationComponent implements OnInit {
  currentUserId: number | null = null;
  subscriptionDetails: Abonnement | null = null;
  generatedCode: string = '';
  submitting: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  isDeleting: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private abonnementService: AbonnementService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.currentUserId = this.loginService.getUserIdFromToken();
  }

  ngOnInit(): void {
    if (!this.currentUserId) {
      console.error('No user ID found, redirecting to login');
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
      console.error(
        'No subscription details found in state, fetching from backend'
      );
      this.fetchAbonnementDetails();
    } else {
      this.showSuccessToast('Email sent with verification code');
    }
  }

  fetchAbonnementDetails(): void {
    if (!this.currentUserId) {
      console.error('Cannot fetch abonnement details: user ID is missing');
      this.router.navigate(['/login']);
      return;
    }

    // Retrieve the abonnementId from localStorage
    const storedId = localStorage.getItem('abonnementId');
    if (!storedId) {
      console.error('No abonnement ID found in localStorage');
      this.showErrorToast(
        'No subscription details available. Redirecting to subscriptions page.'
      );
      this.router.navigate(['/abonnement']);
      return;
    }

    const idAbonnement = parseInt(storedId, 10); // Convert storedId to number
    this.abonnementService
      .getAbonnementById(this.currentUserId, idAbonnement)
      .subscribe({
        next: (response) => {
          this.subscriptionDetails = response;
          this.showSuccessToast('Subscription details loaded successfully');
        },
        error: (err) => {
          console.error('Error fetching abonnement:', err);
          alert('Unable to fetch abonnement details.');
          this.router.navigate(['/abonnement']);
        },
      });
  }

  submitCode(): void {
    if (!this.generatedCode.trim()) {
      this.showErrorToast('Please enter a valid code.');
      return;
    }

    if (!this.currentUserId) {
      this.showErrorToast('User ID is missing. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.subscriptionDetails) {
      this.showErrorToast(
        'Subscription details are missing. Please try again.'
      );
      this.router.navigate(['/abonnement']);
      return;
    }

    this.submitting = true;
    this.abonnementService
      .confirmAbonnement(this.currentUserId, this.generatedCode)
      .subscribe({
        next: (response: Abonnement) => {
          console.log('Subscription confirmed successfully:', response);
          this.subscriptionDetails = response; // Update subscriptionDetails with the response

          // Create userInfo by fetching the user
          let userInfo: UserInfo;
          if (this.subscriptionDetails?.user) {
            console.log(
              'User from subscriptionDetails:',
              this.subscriptionDetails.user
            );
            userInfo = mapUserToUserInfo(this.subscriptionDetails.user);
            console.log('Mapped userInfo from subscriptionDetails:', userInfo);
            this.navigateToConfirmation(userInfo);
          } else {
            console.warn(
              'No user associated with the abonnement, fetching from LoginService'
            );
            this.loginService
              .getUserById(this.currentUserId!)
              .pipe(
                catchError((error) => {
                  console.error('Error fetching user info:', error);
                  // Provide a default user if fetching fails
                  return of({
                    id: this.currentUserId!,
                    nom: 'Utilisateur Inconnu',
                    email: 'N/A',
                  } as User);
                })
              )
              .subscribe((user: User) => {
                console.log('User from LoginService:', user);
                userInfo = mapUserToUserInfo(user);
                console.log('Mapped userInfo from LoginService:', userInfo);
                this.navigateToConfirmation(userInfo);
              });
          }

          this.showSuccessToast('Subscription confirmed successfully');
        },
        error: () => {
          this.submitting = false;
          this.showErrorToast(
            'Invalid code or confirmation failed. Please try again.'
          );
        },
        complete: () => {
          this.submitting = false;
        },
      });
  }

  deleteSubscription(): void {
    if (!this.currentUserId || !this.subscriptionDetails) {
      this.errorMessage = 'User ID or subscription details are missing.';
      return;
    }

    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = null;

    this.abonnementService
      .deleteAbonnement(
        this.currentUserId,
        this.subscriptionDetails.idAbonnement
      )
      .subscribe({
        next: () => {
          this.showSuccessToast('Subscription deleted successfully');
          this.router.navigate(['/abonnement']);
        },
        error: (error) => {
          console.error('Error deleting subscription:', error);
          this.showErrorToast(
            'Failed to delete subscription. Please try again.'
          );
          this.isDeleting = false;
        },
        complete: () => {
          this.isDeleting = false;
        },
      });
  }

  private navigateToConfirmation(userInfo: UserInfo): void {
    const navigationState = {
      abonnement: this.subscriptionDetails,
      userInfo: userInfo,
    };
    console.log(
      'Navigating to /abonnement-confirme with state:',
      navigationState
    );

    this.router
      .navigate(['/abonnement-confirme'], {
        state: navigationState,
      })
      .catch((error) => {
        console.error('Navigation error:', error);
        this.showErrorToast(
          'Unable to navigate. Redirecting to abonnement page.'
        );
        this.router.navigate(['/abonnement']);
      });
  }

  private showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'success';
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  private showErrorToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'error';
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}
