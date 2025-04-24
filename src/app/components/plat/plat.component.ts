import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlatService } from '../../services/plat.service';
import { Plat } from '../../../core/models/plat.model';
import { RegimeAlimentaire } from 'src/core/models/regime.model';
import { RegimeService } from 'src/app/services/regime.service';

@Component({
  selector: 'app-plat',
  templateUrl: './plat.component.html',
  styleUrls: ['./plat.component.css']
})
export class PlatComponent implements OnInit {
  plats: Plat[] = [];
  userId = 1; // À remplacer par l'ID utilisateur réel
  regimes: RegimeAlimentaire[] = [];
  selectedPlats: { [key: number]: boolean } = {}; // Stocke les plats sélectionnés
  selectedRegimeId: number | null = null;  // Stocke les régimes sélectionnés
  constructor(private platService: PlatService, public regimeService: RegimeService, private router: Router) {}

  ngOnInit(): void {
    this.getPlats();
    this.getRegimes();
  }
  getRegimes(): void {
    this.regimeService.getAllRegimes().subscribe(data => {
      this.regimes = data;
    });
  }

  getPlats(): void {
    this.platService.getAllPlats().subscribe(data => {
      this.plats = data;
    });
  }

  // Redirection vers la page de mise à jour
  updatePlat(platId: number): void {
    this.router.navigate(['/updateplat', platId]);
  }

  // Suppression d'un plat
  deletePlat(platId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce plat ?')) {
      this.platService.deletePlat(platId, this.userId).subscribe(() => {
        this.plats = this.plats.filter(p => p.id !== platId);
        console.log(`Plat ${platId} supprimé`);
      });
    }
  }

  // Ajouter un plat à un régime spécifique (exemple)
  assignPlatsToRegime(): void {
    if (!this.selectedRegimeId) {
      alert('Veuillez sélectionner un régime.');
      return;
    }

    const selectedPlatIds = Object.keys(this.selectedPlats)
      .filter(platId => this.selectedPlats[+platId])
      .map(id => +id);

    if (selectedPlatIds.length === 0) {
      alert('Veuillez sélectionner au moins un plat.');
      return;
    }

    this.regimeService.assignPlatsToRegime(this.selectedRegimeId, selectedPlatIds, this.userId)
      .subscribe(() => {
        alert('Plats assignés avec succès !');
        this.selectedPlats = {}; // Réinitialiser la sélection
      });
  }
}
  

