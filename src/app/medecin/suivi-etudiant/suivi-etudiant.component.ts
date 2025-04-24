import { Component, OnInit } from '@angular/core';
import { ProfilNutritionnelService } from 'src/app/services/profil-nutritionnel.service';

@Component({
  selector: 'app-suivi-etudiant',
  templateUrl: './suivi-etudiant.component.html',
  styleUrls: ['./suivi-etudiant.component.scss']
})
export class SuiviEtudiantComponent implements OnInit {
  profils: any[] = [];
  searchTerm = '';
  selectedSexe = 'TOUS';
  selectedRegime = 'TOUS';
  selectedClassification = 'TOUS';

  sexes = ['TOUS', 'HOMME', 'FEMME'];
  regimes = ['TOUS', 'NORMAL', 'SPORTIF', 'VEGETARIEN', 'DIABETIQUE'];
  classifications = ['TOUS', 'Maigreur', 'Normal', 'Surpoids', 'Obésité'];

  constructor(private profilService: ProfilNutritionnelService) {}

  ngOnInit(): void {
    this.profilService.getAllProfils().subscribe({
      next: (data) => {
        this.profils = data;
      },
      error: () => {
        console.error("Erreur de récupération des profils");
      }
    });
  }

  filteredEtudiants() {
    return this.profils.filter(p => {
      const nomMatch = p.user.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const sexeMatch = this.selectedSexe === 'TOUS' || p.sexe === this.selectedSexe;
      const regimeMatch = this.selectedRegime === 'TOUS' || p.regimeAlimentaire === this.selectedRegime;
      const classification = this.classifyIMC(p.imc);
      const classMatch = this.selectedClassification === 'TOUS' || classification === this.selectedClassification;
      return nomMatch && sexeMatch && regimeMatch && classMatch;
    });
  }

  classifyIMC(imc: number): string {
    if (imc < 18.5) return 'Maigreur';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Surpoids';
    return 'Obésité';
  }

  getClassificationColor(imc: number): string {
    if (imc < 18.5) return 'circle-thin';
    if (imc < 25) return 'circle-normal';
    if (imc < 30) return 'circle-warning';
    return 'circle-danger';
  }
}
