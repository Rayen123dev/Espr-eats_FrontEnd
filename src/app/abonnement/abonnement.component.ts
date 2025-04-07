import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Abonnement,
  AbonnementService,
  CreateAbonnementResponse,
} from '../../abonnement.service';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-home',
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
    isRecommended?: boolean;
    userCount?: number; // Add this to store the number of users (optional)
  }[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  toastTitle: string = 'Danger';
  recommendedType: string | null = null;

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
    this.loadRecommendedType(); // Load recommended type first
  }

  loadRecommendedType(): void {
    // Use getRecommendedSubscriptionTypeWithCounts if you implemented user counts
    this.abonnementService.getRecommendedSubscriptionType().subscribe({
      next: (type) => {
        this.recommendedType = type;
        console.log('Recommended subscription type:', this.recommendedType);
        // Load subscription plans after the recommended type is fetched
        this.loadSubscriptionPlans();
      },
      error: (error) => {
        console.error('Error fetching recommended subscription type:', error);
        this.recommendedType = 'MENSUEL';
        // Load subscription plans even if there's an error
        this.loadSubscriptionPlans();
      },
    });

    // If you implemented user counts, use this instead:
    /*
    this.abonnementService.getRecommendedSubscriptionTypeWithCounts().subscribe({
      next: (response) => {
        this.recommendedType = response.recommendedType;
        console.log('Recommended subscription type:', this.recommendedType);
        this.loadSubscriptionPlans(response.counts);
      },
      error: (error) => {
        console.error('Error fetching recommended subscription type:', error);
        this.recommendedType = 'MENSUEL';
        this.loadSubscriptionPlans();
      },
    });
    */
  }

  loadSubscriptionPlans(counts?: { [key: string]: number }): void {
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
            discount: 'Save 0Dt',
            description: 'Un Plan pour un mois',
            features: [
              '3 templates',
              '4 campaigns per month',
              '1,000 active users per month',
              '5MB file size limit',
            ],
            renouvellementAutomatique: false,
            isRecommended: this.recommendedType === 'MENSUEL',
            userCount: counts ? counts['MENSUEL'] : undefined, // Set user count if available
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
            isRecommended: this.recommendedType === 'TRIMESTRIEL',
            userCount: counts ? counts['TRIMESTRIEL'] : undefined,
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
            isRecommended: this.recommendedType === 'SEMESTRIEL',
            userCount: counts ? counts['SEMESTRIEL'] : undefined,
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
            isRecommended: this.recommendedType === 'ANNUEL',
            userCount: counts ? counts['ANNUEL'] : undefined,
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

          if (
            response.stripeResponse &&
            response.stripeResponse.status === 'open'
          ) {
            localStorage.setItem(
              'abonnementId',
              response.abonnement.idAbonnement.toString()
            );
            window.location.href = response.stripeResponse.message;
          } else {
            this.showToast = true;
            this.toastTitle = 'Danger';
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
            this.toastTitle = 'Warning';
            this.toastMessage = 'Tu as déjà créé un abonnement.';
          } else {
            this.showToast = true;
            this.toastTitle = 'Danger';
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
