import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ConsultationService } from 'src/app/services/consultation.service';
import { ProfilNutritionnelService } from 'src/app/services/profil-nutritionnel.service';
import { LoginService } from 'src/app/login.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
// ... imports identiques
export class DashboardComponent implements OnInit {
  userName = '';
  moyennePoids = 0;
  moyenneTaille = 0;
  totalProfils = 0;
  hommes = 0;
  femmes = 0;
  nbFumeurs = 0;

  barChartData!: ChartData<'bar', number[], string>;
  barChartOptions: ChartOptions<'bar'> = { /* ... idem */ };

  pieChartData!: ChartData<'bar', number[], string>;
  pieChartOptions: ChartOptions<'bar'> = { /* ... idem */ };

  allergiesChartData!: ChartData<'pie', number[], string>;
  allergiesChartOptions: ChartOptions<'pie'> = { /* ... idem */ };

  regimesChartData!: ChartData<'pie', number[], string>;
  regimesChartOptions: ChartOptions<'pie'> = { /* ... idem */ };

  constructor(
    private loginService: LoginService,
    private consultationService: ConsultationService,
    private profilService: ProfilNutritionnelService
  ) {}

  async ngOnInit(): Promise<void> {
    const userId = this.loginService.getUserIdFromToken();
    if (userId) {
      const user = await lastValueFrom(this.loginService.getUserById(userId));
      this.userName = user.nom;
      await this.loadStats();
    }
  }

  async loadStats(): Promise<void> {
    const consultations = await lastValueFrom(this.consultationService.getAllConsultations());
    const enAttente = consultations.filter(c => c.statut === 'EN_ATTENTE').length;
    const terminee = consultations.filter(c => c.statut === 'TERMINEE').length;
    const annulee = consultations.filter(c => c.statut === 'ANNULEE').length;

    this.barChartData = {
      labels: ['En attente', 'Terminée', 'Annulée'],
      datasets: [{
        data: [enAttente, terminee, annulee],
        label: 'Consultations',
        backgroundColor: ['#f39c12', '#2ecc71', '#e74c3c']
      }]
    };

    let withRecs = 0;
    for (const c of consultations) {
      const recs = await lastValueFrom(this.consultationService.getRecommandationByConsultationId(c.id));
      if (recs.length > 0) withRecs++;
    }

    this.pieChartData = {
      labels: ['Avec recommandations', 'Sans recommandations'],
      datasets: [{
        data: [withRecs, consultations.length - withRecs],
        backgroundColor: ['#3498db', '#bdc3c7']
      }]
    };

    const profils: any[] = await lastValueFrom(this.profilService.getAllProfils());
    this.totalProfils = profils.length;

    let totalPoids = 0;
    let totalTaille = 0;
    let allergiesMap: Record<string, number> = {};
    let regimesMap: Record<string, number> = {};

    this.hommes = 0;
    this.femmes = 0;
    this.nbFumeurs = 0;

    profils.forEach(p => {
      totalPoids += p.poidsActuel || 0;
      totalTaille += p.taille || 0;

      if (p.sexe === 'HOMME') this.hommes++;
      if (p.sexe === 'FEMME') this.femmes++;
      if (p.fumeur) this.nbFumeurs++;

      if (p.allergies) {
        p.allergies.forEach((a: string) => {
          allergiesMap[a] = (allergiesMap[a] || 0) + 1;
        });
      }

      if (p.regimeAlimentaire) {
        regimesMap[p.regimeAlimentaire] = (regimesMap[p.regimeAlimentaire] || 0) + 1;
      }
    });

    this.moyennePoids = +(totalPoids / profils.length).toFixed(2);
    this.moyenneTaille = +(totalTaille / profils.length).toFixed(2);

    this.allergiesChartData = {
      labels: Object.keys(allergiesMap),
      datasets: [{
        data: Object.values(allergiesMap),
        backgroundColor: ['#e67e22', '#9b59b6', '#16a085', '#d35400']
      }]
    };

    this.regimesChartData = {
      labels: Object.keys(regimesMap),
      datasets: [{
        data: Object.values(regimesMap),
        backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c', '#1abc9c']
      }]
    };
  }
}
