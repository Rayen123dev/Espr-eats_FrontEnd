import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Abonnement,
  AbonnementService,
  CreateAbonnementResponse,
} from '../../abonnement.service';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-home', // Note: selector says 'app-home' but template is 'abonnement.component.html'
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css'],
})
export class AbonnementComponent implements OnInit {
  currentUserId: number | null = null;
  userId: number | null = null;
  subscriptionPlans: {
    type: string;
    cost: number;
    monthlyCost: number;
    discount: string;
    description: string;
    features: string[];
    renouvellementAutomatique: boolean;
  }[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  toastTitle: string = 'Danger';

  constructor(
    private abonnementService: AbonnementService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.currentUserId = this.loginService.getUserIdFromToken();
    this.userId = this.currentUserId;
  }

  ngOnInit(): void {
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadSubscriptionPlans();
  }

  loadSubscriptionPlans(): void {
    this.abonnementService.getSubscriptionTypesAndCosts().subscribe({
      next: (data) => {
        if (!data || typeof data !== 'object') {
          console.error('Invalid subscription data:', data);
          return;
        }
        this.subscriptionPlans = [
          {
            type: 'MENSUEL',
            cost: data['MENSUEL'] || 0,
            monthlyCost: data['MENSUEL'] || 0,
            discount: '',
            description: 'Un Plan pour un mois',
            features: [
              '3 templates',
              '4 campaigns per month',
              '1,000 active users per month',
              '5MB file size limit',
            ],
            renouvellementAutomatique: false,
          },
          {
            type: 'TRIMESTRIEL',
            cost: data['TRIMESTRIEL'] || 0,
            monthlyCost: (data['TRIMESTRIEL'] || 0) / 3,
            discount: 'Save 10Dt',
            description: 'Un Plan pour trois mois',
            features: [
              '5 templates',
              '10 campaigns per month',
              '5,000 active users per month',
              '10MB file size limit',
              'Basic analytics',
            ],
            renouvellementAutomatique: false,
          },
          {
            type: 'SEMESTRIEL',
            cost: data['SEMESTRIEL'] || 0,
            monthlyCost: (data['SEMESTRIEL'] || 0) / 6,
            discount: 'Save 30Dt',
            description: 'Un Plan pour six mois',
            features: [
              '10 templates',
              '20 campaigns per month',
              '10,000 active users per month',
              '50MB file size limit',
              'Advanced analytics',
            ],
            renouvellementAutomatique: false,
          },
          {
            type: 'ANNUEL',
            cost: data['ANNUEL'] || 0,
            monthlyCost: (data['ANNUEL'] || 0) / 12,
            discount: 'Save 80Dt',
            description: 'Un plan pour un an',
            features: [
              'Unlimited templates',
              'Unlimited campaigns',
              '25,000 active users per month',
              '100MB file size limit',
              'Integrations',
            ],
            renouvellementAutomatique: false,
          },
        ];
      },
      error: (error) => {
        console.error('Error fetching subscription plans:', error);
        this.showToast = true;
        this.toastTitle = 'Danger';
        this.toastMessage =
          'Failed to load subscription plans. Please try again later.';
      },
    });
  }

  createSubscription(
    type: string,
    price: number,
    renewalOption: boolean
  ): void {
    if (!this.userId) {
      console.error('No user ID available');
      this.showToast = true;
      this.toastTitle = 'Danger';
      this.toastMessage = 'You must be logged in to create a subscription.';
      this.router.navigate(['/login']);
      return;
    }

    const abonnement = {
      typeAbonnement: type,
      renouvellementAutomatique: renewalOption,
    };

    this.abonnementService
      .createAbonnement(this.userId as number, abonnement)
      .subscribe({
        next: (response: CreateAbonnementResponse) => {
          console.log('Subscription created successfully:', response);
          this.showToast = false;

          // Redirect to Stripe Checkout URL
          if (
            response.stripeResponse &&
            response.stripeResponse.status === 'open'
          ) {
            // Store the abonnement ID in localStorage for use after payment
            localStorage.setItem(
              'abonnementId',
              response.abonnement.idAbonnement.toString()
            );
            window.location.href = response.stripeResponse.message; // Redirect to Stripe
          } else {
            this.showToast = true;
            this.toastTitle = '';
            this.toastMessage =
              'Failed to create Stripe payment session. Please try again.';
          }
        },
        error: (error) => {
          console.error('Error creating subscription:', error);
          if (
            error.error &&
            error.error.message === "L'utilisateur a déjà un abonnement."
          ) {
            this.showToast = true;
            this.toastTitle = '';
            this.toastMessage = 'Tu as déjà créé un abonnement.';
          } else {
            this.showToast = true;
            this.toastTitle = '';
            this.toastMessage = 'Tu as déjà créé un abonnement.';
          }
          setTimeout(() => this.closeToast(), 5000);
        },
      });
  }

  closeToast(): void {
    this.showToast = false;
    this.toastMessage = '';
  }
}
