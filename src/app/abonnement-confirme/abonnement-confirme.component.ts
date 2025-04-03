// abonnement-confirme.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Abonnement } from '../../abonnement.service';
import { UserInfo } from '../user-info.interface';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-abonnement-confirme',
  templateUrl: './abonnement-confirme.component.html',
  styleUrls: ['./abonnement-confirme.component.css'],
})
export class AbonnementConfirmeComponent implements OnInit {
  subscriptionDetails: Abonnement | null = null;
  userInfo: UserInfo | null = null;
  formattedCout: string = 'N/A';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as {
        abonnement: Abonnement;
        userInfo: UserInfo;
      };
      this.subscriptionDetails = state.abonnement;
      this.userInfo = state.userInfo;
      console.log(
        'Navigation state (during navigation):',
        navigation.extras.state
      );
    } else {
      const state = window.history.state;
      if (state && state.abonnement && state.userInfo) {
        this.subscriptionDetails = state.abonnement;
        this.userInfo = state.userInfo;
      }
      console.log('Navigation state (from history):', state);
    }

    console.log('Subscription Details:', this.subscriptionDetails);
    console.log('User Info:', this.userInfo);

    if (!this.subscriptionDetails || !this.userInfo) {
      console.error('No subscription or user info found');
      this.router.navigate(['/abonnement']);
      return;
    }

    if (this.subscriptionDetails.cout !== undefined) {
      this.formattedCout = this.subscriptionDetails.cout.toFixed(2);
    }
  }
  downloadPDF(): void {
    const doc = new jsPDF();

    const title = `Abonnement Confirmation - ${this.userInfo?.name}`;
    const body = `
      Félicitation ${this.userInfo?.name},
      Nous sommes ravis que vous ayez souscrit au plan d'abonnement ${this.subscriptionDetails?.typeAbonnement}.
      Votre commande numéro: ${this.subscriptionDetails?.idAbonnement}
      Un email a été envoyé à: ${this.userInfo?.email}.
      
      Items:
      - ${this.subscriptionDetails?.typeAbonnement} : ${this.subscriptionDetails?.cout} Dt

      Informations:
      - Email: ${this.userInfo?.email}
      - Billing Address: ${this.userInfo?.billingAddress}

      Total: ${this.formattedCout} Dt
    `;

    doc.setFontSize(12);
    doc.text(title, 20, 20);
    doc.text(body, 20, 30);

    doc.save('abonnement_confirmation.pdf');
  }
}
