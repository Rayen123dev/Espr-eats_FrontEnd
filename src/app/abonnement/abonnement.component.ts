import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Abonnement, AbonnementService } from '../../abonnement.service';
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
      return; // Exit early if no user ID
    }
    this.loadSubscriptionPlans();
  }

  loadSubscriptionPlans(): void {
    this.abonnementService.getSubscriptionTypesAndCosts().subscribe({
      next: (data) => {
        // Validate data before assigning to subscriptionPlans
        if (!data || typeof data !== 'object') {
          console.error('Invalid subscription data:', data);
          return;
        }
        this.subscriptionPlans = [
          {
            type: 'MENSUEL',
            cost: data['MENSUEL'] || 0, // Fallback to 0 if undefined
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
        alert('Failed to load subscription plans. Please try again later.');
      },
    });
  }

  // abonnement.component.ts (excerpt)
  createSubscription(
    type: string,
    price: number,
    renewalOption: boolean
  ): void {
    if (!this.userId) {
      console.error('No user ID available');
      alert('You must be logged in to create a subscription.');
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
        next: (response: Abonnement) => {
          console.log('Subscription created successfully:', response);
          this.router.navigate(['/abonnement/payment-confirmation'], {
            state: {
              abonnement: response, // Pass the entire Abonnement object
            },
          });
        },
        error: (error) => {
          console.error('Error creating subscription:', error);
          alert('Failed to create subscription. Please try again.');
        },
      });
  }
}
