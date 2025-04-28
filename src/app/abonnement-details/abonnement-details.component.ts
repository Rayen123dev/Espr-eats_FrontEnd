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
  isLoading: boolean = false;
  isLoadingTransactions: boolean = false;
  isDeleting: boolean = false;
  showToast: boolean = false; // Added for toast notification
  toastMessage: string = ''; // Toast message content
  toastType: 'success' | 'error' = 'success'; // Toast type

  displayPlanName: string = 'Typographic Starter';
  displayCost: string = '10.00 Dt';
  displayRenewalDate: string = 'Jul 1, 2020';

  constructor(
    private router: Router,
    private abonnementService: AbonnementService,
    private loginService: LoginService
  ) {
    this.currentUserId = this.loginService.getUserIdFromToken();
  }

  ngOnInit(): void {
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

    this.fetchAbonnementDetails();
  }

  fetchAbonnementDetails(): void {
    if (!this.currentUserId) {
      console.error('Cannot fetch abonnement details: user ID is missing');
      this.showErrorToast('Utilisateur non connecté. Veuillez vous connecter.');
      this.router.navigate(['/login']);
      return;
    }

    const storedId = localStorage.getItem('abonnementId');
    if (!storedId) {
      console.error('No abonnement ID found in localStorage');
      this.showErrorToast(
        'Aucun abonnement trouvé. Redirection vers la page des abonnements.'
      );
      this.router.navigate(['/abonnement']);
      return;
    }

    const idAbonnement = parseInt(storedId, 10);
    if (isNaN(idAbonnement)) {
      console.error('Invalid abonnement ID in localStorage:', storedId);
      this.showErrorToast(
        "ID d'abonnement invalide. Redirection vers la page des abonnements."
      );
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
          this.fetchTransactions();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching abonnement details:', err);
          this.showErrorToast(
            "Impossible de récupérer les détails de l'abonnement."
          );
          this.isLoading = false;
          this.router.navigate(['/abonnement']);
        },
      });
  }
  navigateToMenu(): void {
    this.router.navigate(['/menu']);
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
      this.showErrorToast(
        'Impossible de récupérer les transactions : informations manquantes.'
      );
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
          console.log('Fetched Transactions:', transactions);
          this.transactions = transactions;
          this.isLoadingTransactions = false;
        },
        error: (err) => {
          console.error('Error fetching transactions:', err);
          this.showErrorToast(
            "Impossible de récupérer l'historique des transactions."
          );
          this.isLoadingTransactions = false;
        },
      });
  }

  setDisplayValues(): void {
    if (this.subscriptionDetails) {
      this.displayPlanName =
        this.subscriptionDetails.typeAbonnement || 'Typographic Starter';
      this.displayCost = this.subscriptionDetails.cout
        ? `${this.subscriptionDetails.cout.toFixed(2)} Dt`
        : '10.00 Dt';
      this.displayRenewalDate =
        this.subscriptionDetails.dateFin || 'Jul 1, 2020';
    }
  }

  deleteSubscription(): void {
    if (!this.currentUserId || !this.subscriptionDetails?.idAbonnement) {
      this.showErrorToast(
        'Impossible de supprimer : ID utilisateur ou abonnement manquant.'
      );
      console.error('Missing user ID or abonnement ID', {
        userId: this.currentUserId,
        abonnementId: this.subscriptionDetails?.idAbonnement,
      });
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      return;
    }

    this.isDeleting = true;

    this.abonnementService
      .deleteAbonnement(
        this.currentUserId,
        this.subscriptionDetails.idAbonnement
      )
      .subscribe({
        next: () => {
          console.log('Subscription deleted successfully');
          this.showSuccessToast('Abonnement supprimé avec succès.');
          this.isDeleting = false;
          localStorage.removeItem('abonnementId');
          setTimeout(() => {
            this.router.navigate(['/abonnement']);
          }, 2000); // Increased delay to 2s for toast visibility
        },
        error: (err) => {
          console.error('Error deleting subscription:', err);
          this.showErrorToast(
            'Échec de la suppression de l’abonnement. Veuillez réessayer.'
          );
          this.isDeleting = false;
        },
        complete: () => {
          this.isDeleting = false;
        },
      });
  }

  // Toast Notification Methods
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

  handleError(error: any, userMessage: string): void {
    console.error(error);
    this.showErrorToast(userMessage);
  }
}
