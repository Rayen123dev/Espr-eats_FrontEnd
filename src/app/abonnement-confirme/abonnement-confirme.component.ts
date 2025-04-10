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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configuration
    const primaryColor = '#2c3e50'; // Dark blue
    const secondaryColor = '#3498db'; // Light blue
    const accentColor = '#ecf0f1'; // Light gray
    const textColor = '#333333'; // Dark gray
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;

    // Header with Logo placeholder
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Confirmation d'Abonnement", pageWidth / 2, 25, {
      align: 'center',
    });

    // Add company logo placeholder (you'd need to add an actual image)
    doc.setFontSize(10);
    doc.text('[Votre Logo Ici]', margin, 15);

    // Watermark
    doc.setTextColor('#e0e0e0');
    doc.setFontSize(40);
    doc.setFont('helvetica', 'italic');
    doc.text('CONFIRMÉ', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });

    // Main content
    doc.setTextColor(textColor);
    doc.setFontSize(12);

    // Greeting Section
    doc.setFont('helvetica', 'bold');
    doc.text(`Félicitations ${this.userInfo?.name || 'Client'},`, margin, 50);
    doc.setFont('helvetica', 'normal');
    const greetingLines = doc.splitTextToSize(
      'Nous sommes ravis de vous compter parmi nos abonnés. Voici les détails de votre souscription :',
      pageWidth - margin * 2
    );
    doc.text(greetingLines, margin, 57);

    // Subscription Details Card
    doc.setFillColor(accentColor);
    doc.roundedRect(margin, 75, pageWidth - margin * 2, 60, 3, 3, 'F');
    doc.setFillColor(secondaryColor);
    doc.roundedRect(margin + 2, 77, pageWidth - (margin * 2 + 4), 8, 2, 2, 'F');

    doc.setTextColor('#ffffff');
    doc.setFontSize(11);
    doc.text("Détails de l'Abonnement", margin + 7, 83);

    doc.setTextColor(textColor);
    doc.setFontSize(10);
    const subDetails = [
      `Type d'abonnement: ${this.subscriptionDetails?.typeAbonnement || 'N/A'}`,
      `ID Commande: ${this.subscriptionDetails?.idAbonnement || 'N/A'}`,
      `Coût: ${this.formattedCout} Dt`,
      `Date début: ${new Date().toLocaleDateString('fr-FR')}`,
      `Statut: Actif`,
    ];

    let yPos = 92;
    subDetails.forEach((line, index) => {
      doc.text(line, margin + 7, yPos + index * 7);
    });

    // User Info Card
    doc.setFillColor(accentColor);
    doc.roundedRect(margin, 140, pageWidth - margin * 2, 45, 3, 3, 'F');
    doc.setFillColor(secondaryColor);
    doc.roundedRect(
      margin + 2,
      142,
      pageWidth - (margin * 2 + 4),
      8,
      2,
      2,
      'F'
    );

    doc.setTextColor('#ffffff');
    doc.text('Informations Client', margin + 7, 148);

    doc.setTextColor(textColor);
    const userDetails = [
      `Email: ${this.userInfo?.email || 'N/A'}`,
      `Adresse: ${this.userInfo?.billingAddress || 'N/A'}`,
      `Confirmé le: ${new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    ];

    yPos = 157;
    userDetails.forEach((line, index) => {
      doc.text(line, margin + 7, yPos + index * 7);
    });

    // Total Section with Signature
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, 195, pageWidth - margin, 195);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${this.formattedCout} Dt`, pageWidth - margin, 205, {
      align: 'right',
    });

    doc.setFontSize(9);
    doc.text('Signature Autorisée:', margin, 215);
    doc.setFont('helvetica', 'italic');
    doc.text('[Signature Électronique]', margin, 225);

    // Footer
    doc.setFillColor(primaryColor);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(8);

    const footerLines = [
      'Votre Service Client - support@votreservice.com - www.votreservice.com',
      `© ${new Date().getFullYear()} Tous droits réservés | Généré le ${new Date().toLocaleDateString(
        'fr-FR'
      )}`,
    ];

    yPos = pageHeight - 15;
    footerLines.forEach((line) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    });

    // Barcode simulation
    doc.setDrawColor(textColor);
    doc.setLineWidth(0.2);
    for (let i = 0; i < 30; i++) {
      const width = Math.random() * 2 + 0.5;
      doc.line(margin + i * 2, 235, margin + i * 2, 245);
    }
    doc.text(
      `Ref: ${this.subscriptionDetails?.idAbonnement || 'N/A'}`,
      margin,
      250
    );

    // Save with unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(
      `confirmation_${
        this.subscriptionDetails?.idAbonnement || 'SUB'
      }_${timestamp}.pdf`
    );
  }
}
