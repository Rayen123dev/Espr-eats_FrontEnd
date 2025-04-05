import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Abonnement,
  AbonnementService,
  Transaction,
} from 'src/abonnement.service';
import { LoginService } from '../login.service';

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
    expiry: '02/2026',
  };
  transactions: Transaction[] = [];
  isLoading: boolean = false; // Add loading state for subscription details
  isLoadingTransactions: boolean = false; // Add loading state for transactions
  errorMessage: string = ''; // Add error message for UI display

  // Default values for display
  displayPlanName: string = 'Typographic Starter';
  displayCost: string = '10.00 Dt'; // Update default to use Dt
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

    // Fetch subscription details regardless of navigation state to ensure we have the latest data
    this.fetchAbonnementDetails();
  }

  fetchAbonnementDetails(): void {
    if (!this.currentUserId) {
      console.error('Cannot fetch abonnement details: user ID is missing');
      this.errorMessage = 'Utilisateur non connecté. Veuillez vous connecter.';
      this.router.navigate(['/login']);
      return;
    }

    // Retrieve the abonnementId from localStorage
    const storedId = localStorage.getItem('abonnementId');
    if (!storedId) {
      console.error('No abonnement ID found in localStorage');
      this.errorMessage =
        'Aucun abonnement trouvé. Redirection vers la page des abonnements.';
      this.router.navigate(['/abonnement']);
      return;
    }

    const idAbonnement = parseInt(storedId, 10);
    if (isNaN(idAbonnement)) {
      console.error('Invalid abonnement ID in localStorage:', storedId);
      this.errorMessage =
        "ID d'abonnement invalide. Redirection vers la page des abonnements.";
      this.router.navigate(['/abonnement']);
      return;
    }

    this.isLoading = true;
    this.abonnementService
      .getAbonnementById(this.currentUserId, idAbonnement)
      .subscribe({
        next: (response) => {
          this.subscriptionDetails = response;
          this.setDisplayValues();
          this.fetchTransactions(); // Fetch transactions after successfully getting abonnement details
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Error fetching abonnement details:', err);
          this.errorMessage =
            "Impossible de récupérer les détails de l'abonnement. Redirection vers la page des abonnements.";
          this.isLoading = false;
          this.router.navigate(['/abonnement']);
        },
      });
  }

  fetchTransactions(): void {
    if (!this.currentUserId || !this.subscriptionDetails?.idAbonnement) {
      console.error(
        'Cannot fetch transactions: user ID or abonnement ID is missing',
        {
          userId: this.currentUserId,
          abonnementId: this.subscriptionDetails?.idAbonnement,
        }
      );
      this.errorMessage =
        'Impossible de récupérer les transactions : informations manquantes.';
      return;
    }

    this.isLoadingTransactions = true;
    this.abonnementService
      .getTransactionsByAbonnementId(
        this.currentUserId,
        this.subscriptionDetails.idAbonnement
      )
      .subscribe({
        next: (transactions) => {
          console.log('Fetched Transactions:', transactions); // Check what transactions are returned
          this.transactions = transactions; // Assign all transactions
          this.isLoadingTransactions = false;
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Error fetching transactions:', err);
          this.errorMessage =
            "Impossible de récupérer l'historique des transactions. Veuillez réessayer plus tard.";
          this.isLoadingTransactions = false;
        },
      });
  }

  setDisplayValues(): void {
    if (this.subscriptionDetails) {
      this.displayPlanName =
        this.subscriptionDetails.typeAbonnement || 'Typographic Starter';
      this.displayCost = this.subscriptionDetails.cout
        ? `${this.subscriptionDetails.cout.toFixed(2)} Dt` // Use Dt instead of $
        : '10.00 Dt';
      this.displayRenewalDate =
        this.subscriptionDetails.dateFin || 'Jul 1, 2020';
    }
  }

  changePlan(): void {
    this.router.navigate(['/abonnement']);
  }

  // New method to handle errors globally
  handleError(error: any, userMessage: string): void {
    console.error(error);
    this.errorMessage = userMessage;
  }
}
