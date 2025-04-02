// payment-confirmation.component.ts
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
  isDeleting: boolean = false; // To show a loading state during deletion
  errorMessage: string | null = null; // To display error messages

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
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }
  }

  fetchAbonnementDetails(): void {
    if (!this.currentUserId) {
      console.error('Cannot fetch abonnement details: user ID is missing');
      this.router.navigate(['/login']);
      return;
    }

    const idAbonnement = 1; // Replace with actual logic to get abonnement ID
    this.abonnementService
      .getAbonnementById(this.currentUserId, idAbonnement)
      .subscribe({
        next: (response) => {
          this.subscriptionDetails = response;
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
          }, 5000);
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
      alert('Please enter a valid code.');
      return;
    }

    if (!this.currentUserId) {
      alert('User ID is missing. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.subscriptionDetails) {
      alert('Subscription details are missing. Please try again.');
      this.router.navigate(['/abonnement']);
      return;
    }

    this.submitting = true;
    this.abonnementService
      .confirmAbonnement(this.currentUserId, this.generatedCode)
      .subscribe({
        next: (response) => {
          console.log('Subscription confirmed successfully:', response);

          let userInfo: UserInfo;
          if (this.subscriptionDetails?.user) {
            userInfo = mapUserToUserInfo(this.subscriptionDetails.user);
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
                  return of({
                    id: this.currentUserId!,
                    nom: 'Unknown User',
                    email: 'unknown@example.com',
                    age: '0',
                    role: 'USER',
                    avatarUrl: '',
                  } as User);
                })
              )
              .subscribe((user: User) => {
                userInfo = mapUserToUserInfo(user);
                this.navigateToConfirmation(userInfo);
              });
          }
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

  // Method to delete the abonnement
  deleteSubscription(): void {
    if (!this.currentUserId || !this.subscriptionDetails) {
      this.errorMessage = 'User ID or subscription details are missing.';
      return;
    }

    // Confirm with the user before deleting (optional, can be moved to the template)
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
          console.log('Subscription deleted successfully');
          // Redirect to the abonnement page after deletion
          this.router.navigate(['/abonnement'], {
            state: { message: 'Subscription deleted successfully' },
          });
        },
        error: (error) => {
          console.error('Error deleting subscription:', error);
          this.errorMessage =
            'Failed to delete subscription. Please try again.';
          this.isDeleting = false;
        },
        complete: () => {
          this.isDeleting = false;
        },
      });
  }

  private navigateToConfirmation(userInfo: UserInfo): void {
    console.log('Navigating to /abonnement-confirme with state:', {
      abonnement: this.subscriptionDetails,
      userInfo: userInfo,
    });

    this.router
      .navigate(['/abonnement-confirme'], {
        state: {
          abonnement: this.subscriptionDetails,
          userInfo: userInfo,
        },
      })
      .then((success) => {
        console.log('Navigation success:', success);
        if (!success) {
          console.error('Navigation failed: Route not found or blocked');
          alert(
            'Unable to navigate to confirmation page. Redirecting to abonnement page.'
          );
          this.router.navigate(['/abonnement']);
        }
      })
      .catch((error) => {
        console.error('Navigation error:', error);
        alert(
          'An error occurred while navigating. Redirecting to abonnement page.'
        );
        this.router.navigate(['/abonnement']);
      });
  }
}
