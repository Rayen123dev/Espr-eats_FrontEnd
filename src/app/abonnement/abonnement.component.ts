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
    originalCost: number;
    monthlyCost: number;
    discount: string | null;
    description: string;
    features: string[];
    renouvellementAutomatique: boolean;
    isRecommended?: boolean;
    userCount?: number;
  }[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  toastTitle: string = 'Danger';
  recommendedType: string | null = null;
  // Black Friday timer properties
  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  showBlackFriday: boolean = false;

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
    this.loadRecommendedType();
    this.startBlackFridayTimer();
  }

  loadRecommendedType(): void {
    this.abonnementService.getRecommendedSubscriptionType().subscribe({
      next: (type) => {
        this.recommendedType = type;
        console.log('Recommended subscription type:', this.recommendedType);
        this.loadSubscriptionPlans();
      },
      error: (error) => {
        console.error('Error fetching recommended subscription type:', error);
        this.recommendedType = 'MENSUEL';
        this.loadSubscriptionPlans();
      },
    });
  }

  loadSubscriptionPlans(counts?: { [key: string]: number }): void {
    this.abonnementService.getSubscriptionTypesAndCosts().subscribe({
      next: (data) => {
        if (!data || typeof data !== 'object') {
          console.error('Invalid subscription data:', data);
          return;
        }

        // Define base costs (same as calculateCout in AbonnementService)
        const baseCosts = {
          MENSUEL: 30.0,
          TRIMESTRIEL: 80.0,
          SEMESTRIEL: 150.0,
          ANNUEL: 280.0,
        };

        this.subscriptionPlans = [
          {
            type: 'MENSUEL',
            cost: data['MENSUEL'] || 0,
            originalCost: baseCosts['MENSUEL'],
            monthlyCost: data['MENSUEL'] || 0,
            discount: null,
            description: 'Un Plan pour un mois',
            features: [
              '3 templates',
              '4 campaigns per month',
              '1,000 active users per month',
              '5MB file size limit',
            ],
            renouvellementAutomatique: false,
            isRecommended: this.recommendedType === 'MENSUEL',
            userCount: counts ? counts['MENSUEL'] : undefined,
          },
          {
            type: 'TRIMESTRIEL',
            cost: data['TRIMESTRIEL'] || 0,
            originalCost: baseCosts['TRIMESTRIEL'],
            monthlyCost: (data['TRIMESTRIEL'] || 0) / 3,
            discount: null,
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
            originalCost: baseCosts['SEMESTRIEL'],
            monthlyCost: (data['SEMESTRIEL'] || 0) / 6,
            discount: null,
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
            originalCost: baseCosts['ANNUEL'],
            monthlyCost: (data['ANNUEL'] || 0) / 12,
            discount: null,
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

        // Calculate actual discounts
        this.subscriptionPlans.forEach((plan) => {
          if (plan.cost < plan.originalCost) {
            const discountPercentage = Math.round(
              ((plan.originalCost - plan.cost) / plan.originalCost) * 100
            );
            plan.discount = `${discountPercentage}% off`;
          } else {
            plan.discount = null;
          }
        });

        // Determine if Black Friday component should be shown
        this.showBlackFriday = this.subscriptionPlans.some(
          (plan) => plan.discount !== null
        );
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

  // Black Friday timer logic
  startBlackFridayTimer(): void {
    // Set target date to a future date (e.g., end of Black Friday sale)
    const targetDate = new Date('2025-04-31T23:59:59').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        this.days = '00';
        this.hours = '00';
        this.minutes = '00';
        this.seconds = '00';
        this.showBlackFriday = false; // Hide component when timer expires
        return;
      }

      this.days = Math.floor(distance / (1000 * 60 * 60 * 24))
        .toString()
        .padStart(2, '0');
      this.hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
        .toString()
        .padStart(2, '0');
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, '0');
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // Handle Black Friday discount link click
  applyBlackFridayDiscount(event: Event): void {
    event.preventDefault();
    this.showToast = true;
    this.toastTitle = 'Info';
    this.toastMessage =
      'Black Friday discount applied! Choose a plan to proceed.';
    setTimeout(() => this.closeToast(), 5000);
  }

  // Get maximum discount for display
  getMaxDiscount(): string {
    const maxDiscount = Math.max(
      ...this.subscriptionPlans
        .filter((plan) => plan.discount)
        .map((plan) => parseInt(plan.discount!.replace('% off', '')))
    );
    return maxDiscount ? `${maxDiscount}% OFF` : '37% OFF';
  }
}
