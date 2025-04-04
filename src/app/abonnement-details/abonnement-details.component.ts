import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Abonnement, AbonnementService } from 'src/abonnement.service';
import { LoginService } from '../login.service';

interface BillingHistory {
  date: string;
  amount: string;
  plan: string;
}

@Component({
  selector: 'app-abonnement-details',
  templateUrl: './abonnement-details.component.html',
  styleUrls: ['./abonnement-details.component.css'],
})
export class AbonnementDetailsComponent implements OnInit {
  currentUserId: number | null = null;
  subscriptionDetails: Abonnement | null = null;
  paymentMethod: { card: string; isDefault: boolean; expiry: string } = {
    card: 'Visa •••• 4242',
    isDefault: true,
    expiry: '02/2024',
  };
  billingHistory: BillingHistory[] = [
    { date: 'Jun 1, 2020', amount: '$10.00', plan: 'Typographic Starter' },
    { date: 'May 1, 2020', amount: '$10.00', plan: 'Typographic Starter' },
    { date: 'Apr 1, 2020', amount: '$10.00', plan: 'Typographic Starter' },
  ];

  // Default values for display
  displayPlanName: string = 'Typographic Starter';
  displayCost: string = '$10.00';
  displayRenewalDate: string = 'Jul 1, 2020';

  constructor(
    private router: Router,
    private abonnementService: AbonnementService,
    private loginService: LoginService
  ) {
    this.currentUserId = this.loginService.getUserIdFromToken();
  }

  ngOnInit(): void {
    // Try to get subscription details from navigation state
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

    // If no subscription details, fetch from backend
    if (!this.subscriptionDetails) {
      this.fetchAbonnementDetails();
    } else {
      this.setDisplayValues();
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
      alert(
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
          this.setDisplayValues();
        },
        error: (err) => {
          console.error('Error fetching abonnement details:', err);
          alert(
            'Unable to fetch subscription details. Redirecting to subscriptions page.'
          );
          this.router.navigate(['/abonnement']);
        },
      });
  }

  setDisplayValues(): void {
    if (this.subscriptionDetails) {
      this.displayPlanName =
        this.subscriptionDetails.typeAbonnement || 'Typographic Starter';
      this.displayCost = this.subscriptionDetails.cout
        ? `$${this.subscriptionDetails.cout.toFixed(2)}`
        : '$10.00';
      this.displayRenewalDate =
        this.subscriptionDetails.dateFin || 'Jul 1, 2020';
    }
  }

  changePlan(): void {
    this.router.navigate(['/abonnement']);
  }

  cancelPlan(): void {
    if (confirm('Are you sure you want to cancel your plan?')) {
      if (this.subscriptionDetails && this.currentUserId) {
        this.abonnementService
          .deleteAbonnement(
            this.currentUserId,
            this.subscriptionDetails.idAbonnement
          )
          .subscribe({
            next: () => {
              alert('Plan cancelled successfully.');
              this.router.navigate(['/abonnement']);
            },
            error: (err) => {
              console.error('Error cancelling plan:', err);
              alert('Failed to cancel plan. Please try again.');
            },
          });
      }
    }
  }

  addPaymentMethod(): void {
    alert('Add payment method functionality to be implemented.');
  }
}
