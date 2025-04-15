import { Component, OnInit } from '@angular/core';
import { RegimeService } from '../../services/regime.service';
import { RegimeAlimentaire } from '../../../core/models/regime.model';

@Component({
  selector: 'app-regime',
  templateUrl: './regime.component.html',
  styleUrls: ['./regime.component.css']
})
export class RegimeComponent implements OnInit {
  regimes: RegimeAlimentaire[] = [];
  selectedRegimeId: number | null = null; // Stocker l'ID du régime sélectionné

  constructor(private regimeService: RegimeService) {}

  ngOnInit(): void {
    this.regimeService.getAllRegimes().subscribe(data => {
      console.log('Données reçues:', data); // Debug
      this.regimes = data;
    });
  }
  

  toggleRegime(regimeId: number): void {
    // Si on clique sur le même régime, on le ferme, sinon on l'affiche
    this.selectedRegimeId = this.selectedRegimeId === regimeId ? null : regimeId;
  }


addPlatToRegime(regimeId: number) {
    console.log("Ajout d'un plat au régime ID:", regimeId);
    // Implémentation future : ouvrir un formulaire/modal
}

removePlatFromRegime(regimeId: number, platId: number) {
    console.log("Suppression du plat ID:", platId, "du régime ID:", regimeId);
    // Implémentation future : appel API pour supprimer
}

editRegime(regimeId: number) {
    console.log("Modification du régime ID:", regimeId);
    // Implémentation future : ouvrir un formulaire/modal
}

}
